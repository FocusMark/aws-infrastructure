import { CloudFormationEvent } from 'focusmark-api-shared';
import { EventProperties } from './event-properties';

export class FMSecureSecretApp {
    stackId: string;
    secretName: string;
    managingStackId: string;

    constructor(event: CloudFormationEvent<EventProperties>) {
        this.stackId = event.stackId;
        this.secretName = event.resourceProperties.secretName;

        let managingStackId = process.env['ManagingStack'];
        if (!managingStackId) {
            console.log('Lambda environment variables is missing the ManagingStack variable required.');
            throw new Error('Lambda environment variables is missing the ManagingStack variable required.');
        }

        this.managingStackId = managingStackId;
    }
}