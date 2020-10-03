// AWS dependencies
let AWS = require('aws-sdk');
let axios = require('axios');

// Build AWS services
let systemManager = new AWS.SSM();

let stackId;
let secretName;
let managingStackId;

// Prefix log messages with the secure string Key so we can differentiate messages logged based on the key based on the key.
function log(message) {
    console.info(`secretName=${secretName}:  ${message} -- CF Stack: ${stackId}`);
}

exports.run = async (event, context) => {
    console.info('Starting secure string CF resource')
    
    try {
        console.info('Pulling the CloudFormation Resource Properties out of the Lambda event.');
        managingStackId = process.env.ManagingStack;
        stackId = event.StackId;
        secretName = event.ResourceProperties.SecretName
    } catch(err) {
        console.info('Failed to pull the ResourceProperties from CloudFormation out of the Event.');
        await sendResponse(event, context, 'FAILED');
        return;
    }
    
    // Validate that we have the required parameters.
    if (!event.ResourceProperties.SecretName) {
        console.info('Resource was not given the secretName parameter');
        await sendResponse(event, context, 'FAILED');
    } else if (!event.ResourceProperties.SecureValue) {
        log('Resource was not given the secureValue');
        await sendResponse(event, context, 'FAILED');
    } else if (!event.ResourceProperties.Description) {
        event.ResourceProperties.Description = 'No description provided.';
    } else if (!event.ResourceProperties.Tags) {
        event.ResourceProperties.Tags = [];
    }
    
    try {
        let outputData = {};
        
        // Cloud Formation is creating a brand new stack and executing us. We will Put a Secure String into SSM for the first time.
        if (event.RequestType === 'Create') {
            log('CloudFormation is creating a new. Creating the SSM Parameter as a Secure String.');
            await createSecureString(event);
            outputData.SecureParameterArn = await getParamArn(event);
            outputData.SecureName = event.ResourceProperties.SecretName;
        } else if (event.RequestType === 'Update') {
            log('CloudFormation is updating an existing Stack. Updating the SSM Parameter as a Secure String by deleting it and re-creating it with the new value.');
            await deleteSecureString(event);
            await createSecureString(event);
            outputData.SecureParameterArn = await getParamArn(event);
            outputData.SecureName = event.ResourceProperties.SecretName;
        } else if (event.RequestType === 'Delete') {
            await deleteSecureString(event);
        }
        
        await sendResponse(event, context, 'SUCCESS', outputData);
    } catch(err) {
        log(err);
        await sendResponse(event, context, 'FAILED');
    }
};

async function createSecureString(event) {
    var ssmParams = {
      Name: event.ResourceProperties.SecretName,
      Value: event.ResourceProperties.SecureValue,
      Description: event.ResourceProperties.Description,
      KeyId: event.ResourceProperties.KmsKey,
      Tier: 'Standard',
      Type: 'SecureString',
      Tags: event.ResourceProperties.Tags
    };
    
    // Force a tag containing our CF Stack Id.
    ssmParams.Tags.push({
        Key: 'custom::fmsecuresecret',
        Value: managingStackId
    });

    try {
        await systemManager.putParameter(ssmParams).promise();
        log('SSM API Put call completed successfully.');
    } catch(error) {
        log('SSM Parameter Store API Put call failed for the Secure String');
        throw error;
    }
}

async function getParamArn(event) {
    var ssmParams = { 
        Name: event.ResourceProperties.SecretName, 
        WithDecryption: false // No need to decrypt the value - we don't need it for what we're doing.
    };
    
    try {
        let getResponse = await systemManager.getParameter(ssmParams).promise();
        return getResponse.Parameter.ARN;
    } catch(err) {
        log('SSM Parameter Store API Get call failed for the Secure String');
        throw err;
    }
}

async function deleteSecureString(event) {
    var ssmParams = { Name: event.ResourceProperties.SecretName };
    
    try {
        await systemManager.deleteParameter(ssmParams).promise();
        log('SSM API Delete call completed successfully for parameter.');
    } catch(error) {
        log('SSM Parameter Store API Delete call failed for the Secure String');
        throw error;
    }
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
    
    log(`Response body:\n${responseBody}`);
    
    var responseOptions = {
        headers: { 'content-type': '', 'content-length': responseBody.length }
    };
    
    try {
        await axios.put(event.ResponseURL, responseBody, responseOptions);
        log('Response to CloudFormation sent successfully');
    } catch(err) {
        log('Response to Cloudformation failed.');
        log(err);
        
        throw new Error('Unable to tell CloudFormation that the Lambda was done.');
    }
}