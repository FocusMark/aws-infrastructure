product_name=$focusmark_productname

# Deploy S3 buckets that are shared across all resources within an environment
sharedbuckets_template='shared-buckets.yaml'
sharedbuckets_stackname=focusmark-"$deployed_environment"-cf-sharedbuckets
echo Deploying the $sharedbuckets_stackname stack.
cd infrastructure

aws cloudformation deploy \
    --template-file $sharedbuckets_template \
    --stack-name $sharedbuckets_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name
        
cd ../hostedzone_nameserver_resolver
sh deploy.sh
cd ../infrastructure

# hostedzone_template='hosted-zones.yaml'
# hostedzone_stackname=$product_name-cf-hostedzones

# echo Deploying the $hostedzone_stackname stack.
# aws cloudformation deploy \
#     --template-file $hostedzone_template \
#     --stack-name $hostedzone_stackname \
#     --capabilities CAPABILITY_NAMED_IAM \
#     --parameter-overrides \
#         ProductName=$focusmark_productname