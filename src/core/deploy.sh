product_name=$focusmark_productname

# Deploy S3 buckets that are shared across all resources within an environment
sharedEnvironmentBuckets_stackname=$product_name-"$deployed_environment"-cf-sharedEnvironmentBuckets
sharedEnvironmentBuckets_template=shared-environment-buckets.yaml
echo Deploying the $sharedbuckets_stackname stack.

aws cloudformation deploy \
    --template-file $sharedEnvironmentBuckets_template \
    --stack-name $sharedEnvironmentBuckets_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name

sharedGlobalBuckets_Stackname=$product_name-global-cf-sharedGlobalBuckets
sharedGlobalBuckets_Template=shared-global-buckets.yaml

echo Deploying the $sharedGlobalBuckets_Stackname
aws cloudformation deploy \
    --template-file $sharedGlobalBuckets_Template \
    --stack-name $sharedGlobalBuckets_Stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        ProductName=$product_name
        
# Deploy the API Gateway Domain
apidomain_template='apigw-logging.yaml'
apidomain_stackname=$product_name-"$deployed_environment"-cf-sharedApiGWLogging
echo Deploying the $apidomain_stackname stack.

aws cloudformation deploy \
    --template-file $apidomain_template \
    --stack-name $apidomain_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name