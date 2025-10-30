import type { INodeProperties } from 'n8n-workflow';

export const formatsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['formats'],
			},
		},
		options: [
			{
				name: 'Get All Supported Formats',
				value: 'getAllFormats',
				description: 'Get a list of all supported file formats',
				action: 'Get all supported formats',
			},
			{
				name: 'Get Format Conversions',
				value: 'getFormatConversions',
				description: 'Get available conversions for a specific format',
				action: 'Get format conversions',
			},
			{
				name: 'Check Conversion Support',
				value: 'checkConversionSupport',
				description: 'Check if a specific conversion is supported',
				action: 'Check conversion support',
			},
			{
				name: 'Get All Supported Conversions',
				value: 'getAllConversions',
				description: 'Get all supported formats with conversion mappings',
				action: 'Get all supported conversions',
			},
		],
		default: 'getAllFormats',
	},
];

export const formatsFields: INodeProperties[] = [
	// Get Format Conversions operation fields
	{
		displayName: 'Format',
		name: 'format',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['formats'],
				operation: ['getFormatConversions'],
			},
		},
		description: 'The source format (e.g., png, pdf, docx)',
	},

	// Check Conversion Support operation fields
	{
		displayName: 'Source Format',
		name: 'sourceFormat',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['formats'],
				operation: ['checkConversionSupport'],
			},
		},
		description: 'The source format (e.g., png, pdf, docx)',
	},
	{
		displayName: 'Target Format',
		name: 'targetFormat',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['formats'],
				operation: ['checkConversionSupport'],
			},
		},
		description: 'The target format (e.g., jpg, docx, mp3)',
	},
];

export const formatsDescription = [...formatsOperations, ...formatsFields];
