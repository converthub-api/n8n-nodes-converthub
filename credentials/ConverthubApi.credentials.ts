import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class ConverthubApi implements ICredentialType {
	name = 'converthubApi';

	displayName = 'Converthub API';

	// Link to your community node's README
	documentationUrl = 'https://github.com/converthub-api/n8n-nodes-converthub#credentials';

	icon: Icon = 'file:converthub.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The API key for ConvertHub API. Get your API key from https://converthub.com/api/signup',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const apiKey = (credentials.apiKey as string).trim();
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${apiKey}`,
		};
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.converthub.com',
			url: '/v2/account',
		},
	};
}
