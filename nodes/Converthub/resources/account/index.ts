import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Account Details',
				value: 'getDetails',
				description: 'Get account information including credits and plan details',
				action: 'Get account details',
			},
		],
		default: 'getDetails',
	},
];

export const accountFields: INodeProperties[] = [];

export const accountDescription = [...accountOperations, ...accountFields];
