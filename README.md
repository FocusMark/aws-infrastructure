The FocusMark AWS Infrastructure repository contains all of the core AWS infrastructure templates used to deploy the supporting resources that the FocusMark platform depends on.

The repository consists of mostly bash scripts and CloudFormation templates. It has been built and tested in a Linux environment. There should be very little work needed to deploy from macOS; deploying from Windows is not supported at this time but could be done with effort.

# Deploy

## Requirements

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)

## Environment Variables
In order to run the deployment script you must have your environment set up with a few environment variables. The following table outlines the environment variables required with example values.

| Key                  | Value Type | Description | Examples                                           |
|----------------------|------------|-------------|----------------------------------------------------|
| deployed_environment | string     | The name of the environment you are deploying into | dev or prod |

In Linux or macOS environments you can set this in your `.bash_profile` file.

```
deployed_environment=prod
export deployed_environment
```

The `deployed_environment` environment variable will be used in all of the names of the resources provisioned during deployment. Using the prod environment for example, the IAM Role created to grant API Gateway access to CloudWatch will be created as `focusmark-prod-role-apigateway_cloudwatch_integration`.

## Infrastructure

The core infrastructure in this repository consists of the following:

- IAM Role granting API Gateway write access to CloudWatch logs
- Certificate for the API DNS
- API Gateway Custom Domain bound to the API DNS certificate
- Cognito UserPool for user account management and OAuth2/OpenID Connect
- Default Application Clients that have access to interact with the Cognito Userpool and OAuth/OIDC flows.

![Core deployment process](/docs/aws-infrastructure-deployment_core.png)![Identity deployment process](/docs/aws-infrastructure-deployment_identity.png)