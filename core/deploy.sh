sharedbuckets_template='shared-buckets.yaml'
sharedbuckets_stackname=focusmark-"$deployed_environment"-cf-sharedbuckets

apidomain_template='api-domain.yaml'
apidomain_stackname=focusmark-"$deployed_environment"-cf-core

certificates_template='api-certificates.yaml'
certificates_stackname=focusmark-"$deployed_environment"-cf-apicertificates

echo Deploying the $sharedbuckets_stackname stack.
aws cloudformation deploy \
    --template-file $sharedbuckets_template \
    --stack-name $sharedbuckets_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides TargetEnvironment=$deployed_environment
    
echo Deploying the $certificates_stackname stack.
aws cloudformation deploy \
    --template-file $certificates_template \
    --stack-name $certificates_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides TargetEnvironment=$deployed_environment

echo Deploying the apidomain_stackname stack.
aws cloudformation deploy \
    --template-file $apidomain_template \
    --stack-name $apidomain_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides TargetEnvironment=$deployed_environment