if [ -z "$deployed_environment" ]
    then 
        echo "\$deployed_environment environment variable is unset!"
        echo "Aborting deployment."
        exit
fi

product_name=$focusmark_productname
echo Deploying into the $deployed_environment environment.

aws cloudformation deploy \
  --template-file example.yaml \
  --stack-name example-$deployed_environment-cf-fmSecureSecret \
  --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name \
        MySecret=foobar