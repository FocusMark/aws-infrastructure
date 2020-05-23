stack_name_core=focusmark-"$deployed_environment"-cf-core
stack_name_certificates=focusmark-"$deployed_environment"-cf-apicertificates
template_file_core='template.yaml'
template_file_certificates='api-certificates.yaml'
    
aws cloudformation deploy \
    --template-file $template_file_certificates \
    --stack-name $stack_name_certificates \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides TargetEnvironment=$deployed_environment

aws cloudformation deploy \
    --template-file $template_file_core \
    --stack-name $stack_name_core \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides TargetEnvironment=$deployed_environment