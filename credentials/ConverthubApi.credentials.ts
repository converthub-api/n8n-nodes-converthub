import type {
	ICredentialDataDecryptedObject,
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
		// The pipe separator in API keys (e.g. "252|abc...") can get corrupted to a
		// non-printable character during n8n credential processing, causing header
		// validation errors. Replace any non-printable character with a pipe to restore it.
		const apiKey = String(credentials.apiKey || '').trim().replace(/[^\x20-\x7E]/g, '|');
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${apiKey}`,
		};
		return requestOptions;
	}
}
