product_name=$focusmark_productname

# Deploy S3 buckets that are shared across all resources within an environment
sharedbuckets_template='shared-buckets.yaml'
sharedbuckets_stackname=focusmark-"$deployed_environment"-cf-sharedbuckets
echo Deploying the $sharedbuckets_stackname stack.

aws cloudformation deploy \
    --template-file $sharedbuckets_template \
    --stack-name $sharedbuckets_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name
    
# Deploy the Route 53 Hosted Zones - MUST run before certificates so that the needed CNAME records can be created when the Certificate template runs.
# Do not have a hosted zone per environment. 
hostedzone_template='hosted-zones.yaml'
hostedzone_stackname=$product_name-cf-hostedzones

echo Deploying the $hostedzone_stackname stack.
aws cloudformation deploy \
    --template-file $hostedzone_template \
    --stack-name $hostedzone_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        ProductName=$product_name
    
# Deploy certificates
certificates_template='api-certificates.yaml'
certificates_stackname=focusmark-"$deployed_environment"-cf-apicertificates
echo Deploying the $certificates_stackname stack.

aws cloudformation deploy \
    --template-file $certificates_template \
    --stack-name $certificates_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name

# Deploy the API Gateway Domain
apidomain_template='api-domain.yaml'
apidomain_stackname=focusmark-"$deployed_environment"-cf-apidomain
echo Deploying the $apidomain_stackname stack.
aws cloudformation deploy \
    --template-file $apidomain_template \
    --stack-name $apidomain_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name