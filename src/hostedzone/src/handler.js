// AWS dependencies
let axios = require('axios');
let AWSXRay = require('aws-xray-sdk');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));

let CloudFormationRequest = require('./cloudformation-request');
let Configuration = require('./configuration');
let GoDaddyRequest = require('./godaddy-request');


// Build AWS services
let route53 = new AWS.Route53();
let systemManager = new AWS.SSM();

exports.run = async (event, context) => {
    console.info('Starting Nameserver resolver process');
    let config = new Configuration();
    console.info(event);
    console.info(config);
    let request = new CloudFormationRequest(event);
    
    // Do not process any request types other than Create
    if (request.requestType !== 'Create') {
        console.info('Resolver executed but CloudFormation is not creating new resources. Resolver will exit.');
        await sendResponse(event, context, 'SUCCESS');
        return;
    } // TODO: Handle 'Delete' by setting the GoDaddy Nameservers back to their default if the API allows for it
    
    console.info('Executing request processing');
    try {
        await processRequest(request, config);
        console.info('Processing wrapped up');
        console.info('Resolver completed successfullly');
        
        await sendResponse(event, context, 'SUCCESS');
    } catch(err) {
        console.info('Processing concluded with an error');
        console.info('Aborting Lambda execution');
        
        await sendResponse(event, context, 'FAILED');
    }
};

async function processRequest(request, config) {
    let hostedZone;
    let godaddyInfo;
    
    try {
        hostedZone = await getHostedZone(request.hostedZoneId);
        console.info('Nameserver data retrieved');
        console.info(hostedZone);
    } catch(hostedZoneError) {
        console.log(hostedZoneError);
        throw new Error('Failed to retrieve the Hosted Zone data');
    }
        
        
    try {
        godaddyInfo = await getGodaddyInfo(config);
    } catch(godaddyError) {
        console.info('Failed to retrieve all of the GoDaddy information needed to process the Nameserver resolver');
        console.log(godaddyError);
        throw new Error('Failed to retrieve the GoDaddy Information');
    }

    console.info('Preparing the API call to GoDaddy');
    let godaddyRequest = new GoDaddyRequest(godaddyInfo.apiUrl, godaddyInfo.secret);
    
    try {
        await godaddyRequest.setNameservers(hostedZone.nameservers);
        console.info('Request processing completed');
    } catch(err) {
        console.info(`${err.response.data.message} with status code ${err.response.status}`);
        throw new Error('Unable to set the Nameservers on GoDaddy');
    }
}

async function getHostedZone(hostedZoneId, callback) {
    console.info('Fetching the Route 53 Hosted Zone and the Nameservers associated with it.');
    let route53Params = {
        Id: hostedZoneId
    };

    try {
        let route53Result = await route53.getHostedZone(route53Params).promise();
        console.info('Building hosted zone and nameserver results object');
        let hostedZone = {
            hostedZoneId: route53Params.Id,
            name: route53Result.HostedZone.Name,
            nameservers: route53Result.DelegationSet.NameServers,
        };
        
        if (hostedZone.name.endsWith('.')) {
            hostedZone.name = hostedZone.name.substring(0, hostedZone.name.length - 1);
        }

        return hostedZone;
    } catch(err) {
        console.log(err);
        throw new Error('Failed to retrieve nameservers from Route 53');
    }
}

async function getGodaddyInfo(config, callback) {
    console.info('Fetching GoDaddy information');
    let apiParams = {
        Name: config.registrarApiParameter
    };
    let secretParams = {
        Name: config.registrarSecretParameter,
        WithDecryption: true
    };
    
    let apiResult, secretResult;
    
    console.info('Looking up the GoDaddy API Parameter from SSM');
    try {
        apiResult = await systemManager.getParameter(apiParams).promise();
    } catch(apiError) {
        console.log(apiError);
        throw new Error('Failed to find the API parameter in SSM');
    }

    console.info('Parameter discovered.');
    console.info('Looking up the GoDaddy API Key and Secret from SSM');
    
    try {
        secretResult = await systemManager.getParameter(secretParams).promise();
    } catch(secretError) {
        console.log(secretError);
        throw new Error('Failed to find the Key and Secret');
    }
    
    console.info('Key and Secret discovered');
    return {
        secret: secretResult.Parameter.Value,
        apiUrl: apiResult.Parameter.Value
    };
}

async function sendResponse(event, context, status, outputs) {
    let responseBody = JSON.stringify({
        Status: status,
        Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: outputs
    });
    
    console.log(`Response body:\n${responseBody}`);
    
    var responseOptions = {
        headers: { 'content-type': '', 'content-length': responseBody.length }
    };
    
    try {
        await axios.put(event.ResponseURL, responseBody, responseOptions);
        console.log('Response to CloudFormation sent successfully');
    } catch(err) {
        console.log('Response to Cloudformation failed.');
        
        throw new Error('Unable to tell CloudFormation that the Lambda was done.');
    }
}