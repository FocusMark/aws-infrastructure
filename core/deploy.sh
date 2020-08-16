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