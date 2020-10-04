The FocusMark AWS Infrastructure repository contains all of the core AWS infrastructure templates used to deploy the supporting resources that the FocusMark platform depends on.

The repository consists of bash scripts, a JavaScript Lambda and CloudFormation templates. It has been built and tested in a Linux environment. There should be very little work needed to deploy from macOS; deploying from Windows is not supported at this time but could be done with a little effort.

# Deploy

## Requirements

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

## Environment Variables
In order to run the deployment script you must have your environment set up with a few environment variables. The following table outlines the environment variables required with example values.

| Key                  | Value Type | Description | Examples                                           |
|----------------------|------------|-------------|----------------------------------------------------|
| deployed_environment | string     | The name of the environment you are deploying into | dev or prod |
| focusmark_productname | string | The name of the product. You _must_ use the name of a Domain that you own. | SuperTodo |
| target_domain | string | The Domain you own in GoDaddy. THis will be used to create a Hosted Zone and set nameservers on the domain. | supertodo.com |
| target_api_url | string | The GoDaddy API url for setting DNS nameservers on your domain. | https://api.godaddy.com/v1/domains/supertodo.com/records |
| target_api_key | string | The API key issued by GoDaddy to manage domains via API calls | abcdefg12345abcdefg |
| target_api_secret | string | The API secret issued by GoDaddy to manage domains via API calls | abcdefg12345abcdefg |


In Linux or macOS environments you can set this in your `.bash_profile` file.

```
export deployed_environment=dev
export focusmark_productname=supertodo
export target_domain=supertodo.com
export target_api_url=https://api.godaddy.com/v1/domains/supertodo.com/records
export target_api_key=abcdefg12345abcdefg
export target_api_secret=abcdefg12345abcdefg

PATH=$PATH:$HOME/.local/bin:$HOME/bin
```

once your `.bash_profile` is set you can refresh the environment

```
$ source ~/.bash_profile
```

The `deployed_environment` and `focusmark_productname` environment variables will be used in all of the names of the resources provisioned during deployment. Using the `prod` environment and `supertodo` as the product name for example, the IAM Role created to grant API Gateway access to CloudWatch will be created as `supertodo-prod-role-apigatewayCloudwatchIntegration`.

## Infrastructure

The core infrastructure in this repository consists of the following:

- IAM Role granting API Gateway write access to CloudWatch logs
- Account wide logging buckets with 30 day Glacier policy and 90 day expiration policy.
- Account wide deployment buckets with 7 day Glacier policy and 14 day expiration policy.
- Environment specific logging buckets with 30 day Glacier policy and 90 day expiration policy.
- Environment specific deployment buckets with 7 day Glacier policy and 14 day expiration policy.
- Hosted Zone for Domain and Nameservers, including a Lambda for assigning AWS Route 53 Nameservers to GoDaddy Domains.
- Lambda for deploying SecureString values into SSM Parameter Store - called FMSecureSecret

![Architecture](/docs/aws-infrastructure.jpeg)

## Deployment

In order to deploy the infrastructure you just need to execute the bash script included in the root directory from a terminal:

```
$ sh deploy.sh
```

This will kick off the process and deploy the /core resources by executing the `/core/deploy.sh` script. Once completed it will deploy the `FMSecureSecret` Lambda under the `/core/fmsecuresecret` directory. It will then move on to deploying the hosted zone and configuring Route 53 to manage DNS for your GoDaddy domain. This is done with a custom CloudFormation Resource that invokes a Lambda. The Lambda queries Route 53 for it's Hosted Zone Nameservers and pushes those Nameservers to your GoDaddy domain for use. This allows Route 53 to manage the DNS moving forward for the domain. This is done by executing the `/hostedzone/deploy.sh` script.

Once the CloudFormation is completed you will have all of the core infrastructure needed to deploy the other templates found in other FocusMark repositories, such as the [auth-infrastructure](https:/github.com/focusmark/auth-infrastructure) repository.

If you do not have a Domain through GoDaddy then you can just execute the `deploy.sh` file within the `/src/core` directory along with the `deploy.sh` script inside of the `/src/fmsecuresecret` directory. There is no need to run the `deploy.sh` script at the root of the repository nor the script under `/src/hostedzone`. You will need to write your own CloudFormation to handle your own HostedZone and Domains. Your CloudFormation _must_ include an exported output called `${ProductName}-route53-dotAppZone` with the `HostedZoneId` as the value. This is critical for other CloudFormation templates to be deployed without issue across each of the repositories.

The following diagram shows the deployment order required to successfully deploy from this repository. The final `Hosted Zone Stack` can be skipped, as mentioned above, if your domain is not registered through GoDaddy. It will need to be substituted with your own CloudFormation.

![Deployment](/docs/deployment-order.jpeg)

## Usage

This repository includes 4 different S3 buckets. There are `global` buckets that are used for resources deployed across the entire account. Anything that is considered a shared resource across all environments within the account can be deployed from the `global` S3 deployment bucket. Logs can be collected in the `global` S3 logging bucket.

For environment specific resource deployments and logging you can use the S3 deployment and logging buckets for the targeted environment. Assuming you set the environment variables during deployment to `dev` then you will have a pair of S3 buckets, one for logging and one for Deployment, created for dev.

> Note: Both Logging Buckets export their Bucket names as an output in CloudFormation. It is encouraged to use the same bucket for all logs across Stacks.

For securing sensitive strings you can use the `FMSecureSecret` Lambda. Since CloudFormation does not support `SecureString` on the SSM Parameter Store `AWS::SSM::Parameter` resource a Lambda was built to facilitate the need. You can deploy `SecureString` resources by invoking the `FMSecureSecret` Lambda as a `Custom::FMSecureSecret` resource in CloudFormation. For an example of this refer to the [Hosted Zone Secrets template](/src/hostedzone/secrets-template.yaml).