// AWS dependencies
// let AWS = require('aws-sdk');
// let axios = require('axios');

// // Build AWS services
// let systemManager = new AWS.SSM();
import { CloudFormationEvent } from 'focusmark-api-shared';
import { EventProperties } from './event-properties';
import { FMSecureSecretApp } from './app';

export const run = async (event: CloudFormationEvent<EventProperties>): Promise<any> => {
    return new FMSecureSecretApp(event);
};