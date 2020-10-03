if [ -z "$deployed_environment" ]
    then 
        echo "\$deployed_environment environment variable is unset!"
        echo "Aborting deployment."
        exit
fi

# Deploy core infrastructure
echo Deploying into the $deployed_environment environment.

echo Deploying core cross-cutting infrastructure
cd src/core
sh deploy.sh
cd ../..

# Deploy Custom::FMSecureSecret Lambda
echo Deploying FMSecureSecret Lambda for custom CloudFormation resource usage
cd src/fmsecuresecret
sh deploy.sh
cd ../..

# Hosted Zone must be deployed before anything further  as everything after it depends on the certificates and DNS that is built on-top of the Hosted Zone.
echo Deploying Hosted Zone for domain management
cd src/hostedzone
sh deploy.sh
cd ../..