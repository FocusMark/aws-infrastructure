class CloudFormationRequest {
    constructor(event) {
        this.requestType = event.RequestType;
        this.responseUrl = event.ResponseURL;
        this.stackId = event.StackId;
        this.requestId = event.RequestId;
        this.logicalResourceId = event.LogicalResourceId;
        this.resourceType = event.ResourceType;
        this.functionName = event.ResourceProperties.FunctionName;
        this.hostedZoneId = event.ResourceProperties.HostedZoneId;
    }
}

module.exports = CloudFormationRequest;