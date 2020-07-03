stack_name_identity=focusmark-"$deployed_environment"-cf-identity
template_file_identity='identity.yaml'

stack_name_resource_servers=focusmark-"$deployed_environment"-cf-resourceservers
template_file_resource_servers='resource-servers.yaml'

stack_name_client_apps=focusmark-"$deployed_environment"-cf-clientapps
template_file_client_apps='client-apps.yaml'

# UserPool deployment
aws cloudformation deploy --template-file $template_file_identity --stack-name $stack_name_identity --parameter-overrides TargetEnvironment=$deployed_environment

# UserPool Resource Servers
aws cloudformation deploy --template-file $template_file_resource_servers --stack-name $stack_name_resource_servers --parameter-overrides TargetEnvironment=$deployed_environment

# Client Apps deployment
aws cloudformation deploy --template-file $template_file_client_apps --stack-name $stack_name_client_apps --parameter-overrides TargetEnvironment=$deployed_environment