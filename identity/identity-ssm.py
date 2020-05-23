import boto3, json, argparse, time
from string import Template

# Clients to pull Secrets and Ids from
identity_client_id_key = 'IdentityClientId'
#ios_client_id_key = 'iOSClientId'

# Template constants that are used through-out
client_secret_parameter_template = Template('/focusmark/$target_environment/identity/client_secret')
client_id_parameter_template = Template('/focusmark/$target_environment/identity/client_id')
user_pool_id_parameter_template = Template('/focusmark/$target_environment/identity/user_pool_id')

# Parse the command line parameters
parser = argparse.ArgumentParser(description='FocusMark Identity deployment')
parser.add_argument('--stack-name', type=str, default=None, required=True, help='The CloudFormation stack that was deployed')
parser.add_argument('--target-environment', type=str, default=None, required=True, help='The environment that the resources will be deployed to.')
parser.add_argument('--delete', action='store_true', help='Deletes the SSM Parameter Store entries rather than putting or updating them.')
args = parser.parse_args()

# Pull the parameters out
target_environment = args.target_environment
stack_name = args.stack_name
delete_parameters = args.delete

# Construct our parameters actual values from the templates and arguments combined.
client_secret_parameter = client_secret_parameter_template.substitute(target_environment=target_environment)
client_id_parameter = client_id_parameter_template.substitute(target_environment=target_environment)
user_pool_id_parameter = user_pool_id_parameter_template.substitute(target_environment=target_environment)

print('Fetching App Client Secret from deployed stack')
cf_client = boto3.client('cloudformation')
cf_response = cf_client.describe_stacks(StackName=stack_name)

stacks = cf_response['Stacks']
outputs = stacks[0]['Outputs']
identity_client_id = None
identity_client_secret = None
user_pool_id = None

for output_item in outputs:
    if output_item['OutputKey'] == identity_client_id_key:
        identity_client_id = output_item['OutputValue']
    if output_item['OutputKey'] == 'UserPoolId':
        user_pool_id = output_item['OutputValue']

idp_client = boto3.client('cognito-idp')
identity_response = idp_client.describe_user_pool_client(UserPoolId=user_pool_id, ClientId=identity_client_id)
identity_client = identity_response['UserPoolClient']
identity_client_secret = identity_client['ClientSecret']

print('Processing ' + identity_client_id_key + ' for User Pool ' + user_pool_id + ' with SSM Parameter Store')
ssm_client = boto3.client('ssm')

# TODO: Should store using KMS key for encryption
if delete_parameters == False:
    ssm_client.put_parameter(Name=client_secret_parameter,Value=identity_client_secret,Type='String', Overwrite=True)
    ssm_client.put_parameter(Name=client_id_parameter,Value=identity_client_id,Type='String', Overwrite=True)
    ssm_client.put_parameter(Name=user_pool_id_parameter,Value=user_pool_id,Type='String', Overwrite=True)
    print('SSM processing completed, parameters added or updated.')
else:
    ssm_client.delete_parameters(
        Names=[
            client_secret_parameter,
            client_id_parameter,
            user_pool_id_parameter
        ]
    )