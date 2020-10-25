echo Deploying into the $deployed_environment environment.
product_name=$focusmark_productname

# Execute the SAM CLI Deploy command to upload the Lambdas to S3 and deploy them
sam_stack_name=$product_name-$deployed_environment-sam-fmSecureSecret
sam_template_file='template.yaml'
sam_s3_bucket_name=$product_name-$deployed_environment-s3-deployments

npm install
cfn-lint $sam_template_file

echo Deploying the $sam_stack_name stack.
sam deploy \
  --template-file $sam_template_file \
  --stack-name $sam_stack_name \
  --s3-bucket $sam_s3_bucket_name \
  --s3-prefix $sam_stack_name \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
      TargetEnvironment=$deployed_environment \
      ProductName=$product_name