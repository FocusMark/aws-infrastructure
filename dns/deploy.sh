product_name=$focusmark_productname

# Deploy the Route 53 Hosted Zones
dnsrecords_template='dns-records.yaml'
dnsrecords_stackname=focusmark-"$deployed_environment"-cf-dnsrecords

echo Deploying the $dnsrecords_stackname stack.
aws cloudformation deploy \
    --template-file $dnsrecords_template \
    --stack-name $dnsrecords_stackname \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name