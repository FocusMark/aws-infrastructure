if [ -z "$deployed_environment" ]
    then 
        echo "\$deployed_environment environment variable is unset!"
        echo "Aborting deployment."
        exit
fi

# Deploy core infrastructure
echo Deploying into the $deployed_environment environment.

cd core
sh deploy.sh

cd ../identity
sh deploy.sh