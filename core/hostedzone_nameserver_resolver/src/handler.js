// AWS dependencies
let AWSXRay = require('aws-xray-sdk');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));
let response = require('cfn-response');

let CloudFormationRequest = require('./cloudformation-request');
let Configuration = require('./configuration');
let GoDaddyRequest = require('./godaddy-request');


// Build AWS services
let route53 = new AWS.Route53();
let systemManager = new AWS.SSM();
let secretsManager = new AWS.SecretsManager();

exports.run = async (event, context) => {
    try {
        let config = new Configuration();
        console.info(event);
        console.info(config);
        let request = new CloudFormationRequest(event);
        
        // Do not process any request types other than Create
        if (request.requestType !== 'Create') {
            response.send(event, context, "SUCCESS")
            return;
        }
        
        await processRequest(request);
        response.send(event, context, "SUCCESS");
    } catch(err) {
        console.info(err);
        console.info('Aborting Lambda execution');
        response.send(event, context, 'FAILED');
        return;
    }
};

async function processRequest(request, config) {
    let hostedZone = await getHostedZone(request.hostedZoneId);
    let godaddyInfo = await getGodaddyInfo(config);
    
    let godaddyRequest = new GoDaddyRequest(godaddyInfo.apiUrl, godaddyInfo.secret);
    await godaddyRequest.setNameservers(hostedZone.nameservers);
}

async function getHostedZone(hostedZoneId) {
    let ssmParams = {
        Name: hostedZoneId
    };
    
    let ssmResult = await systemManager.getParameter(ssmParams).promise();
    
    let route53Params = {
        Id: ssmResult.Parameter.Value
    };

    let route53Result = await route53.getHostedZone(route53Params).promise();
    let hostedZone = {
        hostedZoneId: route53Params.Id,
        name: route53Result.HostedZone.Name,
        nameservers: route53Result.DelegationSet.NameServers,
    };
    
    if (hostedZone.name.endsWith('.')) {
        hostedZone.name = hostedZone.name.substring(0, hostedZone.name.length - 1);
    }
    
    return hostedZone;
}

async function getGodaddyInfo(config) {
    let ssmParams = {
        Name: config.registrarApiParameter
    };
    let secretParams = {
        SecretId: config.registrarSecretParameter
    };
    
    let ssmResult = await systemManager.getParameter(ssmParams).promise();
    let secretResult = await secretsManager.getSecretValue(secretParams).promise();
    
    return {
        secret: secretResult.SecretString,
        apiUrl: ssmResult.Parameter.Value
    };
}