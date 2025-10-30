import type { INodeProperties } from 'n8n-workflow';

export const conversionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
			},
		},
		options: [
			{
				name: 'Cancel Job',
				value: 'cancelJob',
				description: 'Cancel a conversion job',
				action: 'Cancel conversion job',
			},
			{
				name: 'Convert File',
				value: 'convertFile',
				description: 'Convert a file from one format to another',
				action: 'Convert a file',
			},
			{
				name: 'Convert From URL',
				value: 'convertUrl',
				description: 'Convert a file from a URL',
				action: 'Convert file from URL',
			},
			{
				name: 'Delete Conversion',
				value: 'deleteConversion',
				description: 'Delete a completed conversion file',
				action: 'Delete conversion file',
			},
			{
				name: 'Get Download URL',
				value: 'getDownloadUrl',
				description: 'Get the download URL for a completed conversion',
				action: 'Get download URL',
			},
			{
				name: 'Get Job Status',
				value: 'getStatus',
				description: 'Check the status of a conversion job',
				action: 'Get job status',
			},
		],
		default: 'convertFile',
	},
];

export const conversionFields: INodeProperties[] = [
	// Convert File operation fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertFile'],
			},
		},
		description: 'Name of the binary property containing the file to convert',
	},
	{
		displayName: 'Target Format',
		name: 'targetFormat',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertFile'],
			},
		},
		description: 'The format to convert to (e.g., pdf, jpg, png, docx, mp3)',
		placeholder: 'pdf',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertFile'],
			},
		},
		options: [
			{
				displayName: 'Output Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to store the converted file',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertFile'],
			},
		},
		options: [
			{
				displayName: 'Bitrate',
				name: 'bitrate',
				type: 'string',
				default: '',
				description: 'Bitrate for audio/video conversions (e.g., 320k)',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Metadata',
				description: 'Custom metadata for tracking',
				options: [
					{
						displayName: 'Metadata',
						name: 'metadataValues',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Output Filename',
				name: 'output_filename',
				type: 'string',
				default: '',
				description: 'Custom name for the output file',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				default: 85,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Quality setting for lossy formats (1-100)',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'string',
				default: '',
				description: 'Resolution for image/video conversions (e.g., 1920x1080)',
			},
			{
				displayName: 'Sample Rate',
				name: 'sample_rate',
				type: 'number',
				default: 44100,
				description: 'Sample rate for audio conversions',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhook_url',
				type: 'string',
				default: '',
				description: 'URL to receive webhook notification when conversion completes',
			},
		],
	},

	// Convert from URL operation fields
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertUrl'],
			},
		},
		description: 'URL of the file to convert',
	},
	{
		displayName: 'Target Format',
		name: 'targetFormat',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertUrl'],
			},
		},
		description: 'The format to convert to (e.g., pdf, jpg, png, docx, mp3)',
		placeholder: 'pdf',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertUrl'],
			},
		},
		options: [
			{
				displayName: 'Output Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to store the converted file',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['convertUrl'],
			},
		},
		options: [
			{
				displayName: 'Bitrate',
				name: 'bitrate',
				type: 'string',
				default: '',
				description: 'Bitrate for audio/video conversions (e.g., 320k)',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Metadata',
				description: 'Custom metadata for tracking',
				options: [
					{
						displayName: 'Metadata',
						name: 'metadataValues',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Output Filename',
				name: 'output_filename',
				type: 'string',
				default: '',
				description: 'Custom name for the output file',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				default: 85,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Quality setting for lossy formats (1-100)',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'string',
				default: '',
				description: 'Resolution for image/video conversions (e.g., 1920x1080)',
			},
			{
				displayName: 'Sample Rate',
				name: 'sample_rate',
				type: 'number',
				default: 44100,
				description: 'Sample rate for audio conversions',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhook_url',
				type: 'string',
				default: '',
				description: 'URL to receive webhook notification when conversion completes',
			},
		],
	},

	// Get Status, Get Download URL, Cancel Job, Delete Conversion - all need Job ID
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['getStatus', 'getDownloadUrl', 'cancelJob', 'deleteConversion'],
			},
		},
		description: 'The job ID of the conversion',
	},
];

export const conversionDescription = [...conversionOperations, ...conversionFields];
