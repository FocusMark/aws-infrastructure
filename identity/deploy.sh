product_name=$focusmark_productname

# UserPool deployment
stack_name_identity=focusmark-"$deployed_environment"-cf-customeridentity
template_file_identity='identity.yaml'

echo Deploying the $stack_name_identity stack.
aws cloudformation deploy \
    --template-file $template_file_identity \
    --stack-name $stack_name_identity \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name

# UserPool Resource Servers. This Stack must exist before Client Apps can be deployed as they depend on the Scopes defined in the Resource Server Stack.
stack_name_resource_servers=focusmark-"$deployed_environment"-cf-resourceservers
template_file_resource_servers='resource-servers.yaml'

echo Deploying the $stack_name_resource_servers stack.
aws cloudformation deploy \
    --template-file $template_file_resource_servers \
    --stack-name $stack_name_resource_servers \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name

# Client Apps deployment
stack_name_client_apps=focusmark-"$deployed_environment"-cf-clientapps
template_file_client_apps='client-apps.yaml'

echo Deploying the $stack_name_client_apps stack.
aws cloudformation deploy \
    --template-file $template_file_client_apps \
    --stack-name $stack_name_client_apps \
    --parameter-overrides \
        TargetEnvironment=$deployed_environment \
        ProductName=$product_name