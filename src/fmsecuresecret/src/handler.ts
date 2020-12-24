// AWS dependencies
let AWS = require('aws-sdk');
let axios = require('axios');

// Build AWS services
let systemManager = new AWS.SSM();

export const run = async (event: ApiGatewayEvent): Promise<any> => {
    return { body: 'test', statusCode: 200 };
};