The FocusMark AWS Infrastructure repository contains all of the core AWS infrastructure templates used to deploy the supporting resources that the FocusMark platform depends on.

The repository consists of bash scripts, a JavaScript Lambda and CloudFormation templates. It has been built and tested in a Linux environment. There should be very little work needed to deploy from macOS; deploying from Windows is not supported at this time but could be done with a little effort.

# Deploy

## Requirements

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)

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

The `deployed_environment` and `focusmark_productname` environment variables will be used in all of the names of the resources provisioned during deployment. Using the `prod` environment and `supertodo` as the product name for example, the IAM Role created to grant API Gateway access to CloudWatch will be created as `supertodo-prod-role-apigateway_cloudwatch_integration`.

## Infrastructure

The core infrastructure in this repository consists of the following:

- IAM Role granting API Gateway write access to CloudWatch logs
- Account wide logging buckets with 30 day Glacier policy and 90 day expiration policy.
- Account wide deployment buckets with 7 day Glacier policy and 14 day expiration policy.
- Environment specific logging buckets with 30 day Glacier policy and 90 day expiration policy.
- Environment specific deployment buckets with 7 day Glacier policy and 14 day expiration policy.
- Hosted Zone for Domain and Nameservers
- Lambda for deploying SecureString values into SSM Parameter Store - called FMSecureSecret

![Architecture](/docs/aws-infrastructure-design.jpeg)

## Deployment

In order to deploy the infrastructure you just need to execute the bash script included from a terminal:

```
$ sh deploy.sh
```

This will kick off the process and deploy the /core resources by executing the `/core/deploy.sh` script. It will then move on to deploying the hosted zone and configuring Route 53 to manage DNS for your GoDaddy domain. This is done with a custom CloudFormation Resource that invokes a Lambda. The Lambda queries Route 53 for it's Hosted Zone Nameservers and pushes those Nameservers to your GoDaddy domain for use. This allows Route 53 to manage the DNS moving forward for the domain. This is done by executing the `/hostedzone/deploy.sh` script.

Once the CloudFormation is completed you will have all of the core infrastructure needed to deploy the other templates found in other FocusMark repositories, such as the [auth-infrastructure](https:/github.com/focusmark/auth-infrastructure) repository.