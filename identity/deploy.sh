# UserPool deployment
stack_name_identity=focusmark-"$deployed_environment"-cf-identity
template_file_identity='identity.yaml'

echo Deploying the $stack_name_identity stack.
aws cloudformation deploy --template-file $template_file_identity --stack-name $stack_name_identity --parameter-overrides TargetEnvironment=$deployed_environment

# Client Apps deployment
stack_name_client_apps=focusmark-"$deployed_environment"-cf-clientapps
template_file_client_apps='client-apps.yaml'

echo Deploying the $stack_name_client_apps stack.
aws cloudformation deploy --template-file $template_file_client_apps --stack-name $stack_name_client_apps --parameter-overrides TargetEnvironment=$deployed_environment