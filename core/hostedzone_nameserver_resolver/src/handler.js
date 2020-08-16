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

// async function test(event,context) {
//     return new Promise(function(resolve,reject) {
//         response.send(event, context, "SUCCESS");
//         resolve();
//     });
// }

exports.run = (event, context) => {
    console.info('Starting Nameserver resolver process')
    let config = new Configuration();
    console.info(event);
    console.info(config);
    let request = new CloudFormationRequest(event);
    
    // Do not process any request types other than Create
    if (request.requestType !== 'Create') {
        console.info('Resolver executed but CloudFormation is not creating new resources. Resolver will exit.');
        response.send(event, context, "SUCCESS")
        return;
    } // TODO: Handle 'Delete' by setting the GoDaddy Nameservers back to their default if the API allows for it
    
    console.info('Executing request processing');
    processRequest(request, config, function(err) {
        console.info('Processing wrapped up');
        if (err) {
            console.info('Processing concluded with an error');
            console.info(err);
            console.info('Aborting Lambda execution');
            response.send(event, context, "FAILED");
            return;                
        }
        
        console.info('Resolver completed successfullly');
        response.send(event, context, "SUCCESS");
    });
};

function processRequest(request, config, callback) {
    getHostedZone(request.hostedZoneId, function(hostedZone, hostedZoneError) {
        if (hostedZoneError) {
            callback(hostedZoneError);
            return;
        }
        
        console.info('Nameserver data retrieved');
        console.info(hostedZone);
        
        getGodaddyInfo(config, function(godaddyInfo, godaddyError) {
            if (godaddyError) {
                console.info('Failed to retrieve all of the GoDaddy information needed to process the Nameserver resolver');
                callback(godaddyError);
                return;
            }
            
            console.info('Preparing the API call to GoDaddy');
            let godaddyRequest = new GoDaddyRequest(godaddyInfo.apiUrl, godaddyInfo.secret);
            godaddyRequest.setNameservers(hostedZone.nameservers);
            
            console.info('Request processing completed');
            callback();
        });
    });
 
}

function getHostedZone(hostedZoneId, callback) {
    console.info('Fetching the Route 53 Hosted Zone and the Nameservers associated with it.');
    let route53Params = {
        Id: hostedZoneId
    };

    route53.getHostedZone(route53Params, function(err, route53Result) {
        if (err) {
            console.info('Failed to retrieve nameservers from Route 53');
            callback(null, err);
            return;
        }
        
        console.info('Building hosted zone and nameserver results object');
        let hostedZone = {
            hostedZoneId: route53Params.Id,
            name: route53Result.HostedZone.Name,
            nameservers: route53Result.DelegationSet.NameServers,
        };
        
        if (hostedZone.name.endsWith('.')) {
            hostedZone.name = hostedZone.name.substring(0, hostedZone.name.length - 1);
        }

        callback(hostedZone);
    });
}

async function getGodaddyInfo(config, callback) {
    console.info('Fetching GoDaddy information');
    let ssmParams = {
        Name: config.registrarApiParameter
    };
    let secretParams = {
        SecretId: config.registrarSecretParameter
    };
    
    console.info('Looking up the GoDaddy API Parameter from SSM');
    systemManager.getParameter(ssmParams, function(ssmError, ssmResult) {
        if (ssmError) {
            console.info('Failed to find the API parameter in SSM');
            callback(null, ssmError);
            return;
        }
        
        console.info('Parameter discovered.');
        console.info('Looking up the GoDaddy API Key and Secret from Secret Manager');
        secretsManager.getSecretValue(secretParams, function(secretError, secretResult) {
            if (secretError) {
                console.info('Failed to find the Key and Secret');
                callback(null, secretError);
                return;
            }
            
            console.info('Key and Secret discovered');
            callback({
                secret: secretResult.SecretString,
                apiUrl: ssmResult.Parameter.Value
            });
        });
    });
}