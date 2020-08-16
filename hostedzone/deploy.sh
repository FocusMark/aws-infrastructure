product_name=$focusmark_productname

echo Deploying into the $deployed_environment environment.
npm install

# Execute the SAM CLI Deploy command to upload the Lambdas to S3 and deploy them
sam_stack_name=$product_name-sam-hostedzone-nameservers-focusmarkdotapp
sam_template_file='template.sam'
sam_s3_bucket_name=$product_name-$deployed_environment-s3-deployments

echo Deploying the $sam_stack_name stack.
sam deploy \
  --template-file $sam_template_file \
  --stack-name $sam_stack_name \
  --s3-bucket $sam_s3_bucket_name \
  --s3-prefix $sam_stack_name \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
      TargetEnvironment=$deployed_environment \
      ProductName=$product_name \
      TargetDomain=$target_domain \
      TargetApiUrl=$target_api_url \
      TargetApiKey=$target_api_key \
      TargetApiSecret=$target_api_secret \