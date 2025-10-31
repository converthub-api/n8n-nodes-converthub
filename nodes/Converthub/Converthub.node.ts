import {
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IDataObject,
} from 'n8n-workflow';

import { conversionDescription } from './resources/conversion';
import { formatsDescription } from './resources/formats';
import { accountDescription } from './resources/account';

export class Converthub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ConvertHub',
		name: 'converthub',
		icon: 'file:converthub.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Convert files between 800+ formats using ConvertHub API',
		defaults: {
			name: 'ConvertHub',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'converthubApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.converthub.com/v2',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Conversion',
						value: 'conversion',
						description: 'Convert files between formats',
					},
					{
						name: 'Format',
						value: 'formats',
						description: 'Get information about supported formats',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Get account information',
					},
				],
				default: 'conversion',
			},
			...conversionDescription,
			...formatsDescription,
			...accountDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Helper function to poll for job completion
		const pollForCompletion = async (
			jobId: string,
			downloadFile = true,
			binaryPropertyName = 'data',
			itemIndex = 0,
			expectedFilename?: string,
		): Promise<INodeExecutionData> => {
			const maxAttempts = 150; // 150 attempts * 2 seconds = 5 minutes max
			let attempts = 0;

			while (attempts < maxAttempts) {
				try {
					const statusResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'converthubApi',
						{
							method: 'GET',
							url: `https://api.converthub.com/v2/jobs/${jobId}`,
							json: true,
						},
					);

					const success = (statusResponse as IDataObject).success as boolean;
					const status = (statusResponse as IDataObject).status as string;

					// Check if the conversion is completed
					if (status === 'completed' && success === true) {
						// Get the download URL
						const downloadResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: `https://api.converthub.com/v2/jobs/${jobId}/download`,
								json: true,
							},
						);

						const downloadUrl = (downloadResponse as IDataObject).download_url as string;
						const result: INodeExecutionData = {
							json: {
								...statusResponse,
								download_url: downloadUrl,
							},
						};

						// Download the file if requested
						if (downloadFile && downloadUrl) {
							const fileBuffer = await this.helpers.httpRequest({
								method: 'GET',
								url: downloadUrl,
								encoding: 'arraybuffer',
							});

							// Use the expected filename if provided, otherwise extract from status response or URL
							const outputFilename =
								expectedFilename ||
								(statusResponse as IDataObject).output_filename ||
								downloadUrl.split('/').pop() ||
								'converted-file';

							result.binary = {
								[binaryPropertyName]: await this.helpers.prepareBinaryData(
									Buffer.from(fileBuffer as ArrayBuffer),
									outputFilename as string,
								),
							};
						}

						return result;
					}

					// Check if the conversion failed - only check success flag
					// The status field can be inconsistent, success flag is the reliable indicator
					if (success === false) {
						const errorObj = (statusResponse as IDataObject).error;
						let errorMessage = 'Unknown error';

						// The error object has { code: "...", message: "..." }
						if (errorObj && typeof errorObj === 'object') {
							const errMsg = (errorObj as IDataObject).message;
							if (errMsg && typeof errMsg === 'string') {
								errorMessage = errMsg;
							}
						} else if (typeof errorObj === 'string') {
							errorMessage = errorObj;
						}

						throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
					}

					// If status is "processing" or "queued", continue polling
				} catch (error) {
					// If it's an HTTP error, try to extract the error message from the response
					if (error.response?.body) {
						const errorBody = error.response.body;
						const errorMessage =
							errorBody.error || errorBody.message || errorBody.errors || 'Unknown error';
						throw new NodeOperationError(this.getNode(), `Conversion failed: ${errorMessage}`);
					}
					// Re-throw if it's already a conversion failed error
					if (error.message && error.message.includes('Conversion failed')) {
						throw error;
					}
					// Otherwise, it might be a network error, so continue polling
				}

				// Wait 2 seconds before next poll
				await sleep(2000);
				attempts++;
			}

			throw new NodeOperationError(this.getNode(), 'Conversion timed out after 5 minutes');
		};

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'conversion') {
					if (operation === 'convertFile') {
						// Get the binary property name
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const targetFormat = this.getNodeParameter('targetFormat', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const outputBinaryPropertyName = (options.binaryPropertyName as string) || 'data';

						// Get the binary data
						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

						// Generate output filename from source filename if not provided
						let outputFilename = additionalFields.output_filename as string | undefined;
						if (!outputFilename && binaryData.fileName) {
							// Get filename without extension and add new extension
							const baseName = binaryData.fileName.replace(/\.[^/.]+$/, '');
							outputFilename = `${baseName}.${targetFormat}`;
						}

						// Convert file to base64 for upload (workaround for n8n Cloud compatibility)
						const base64File = dataBuffer.toString('base64');

						// Prepare request body
						const body: IDataObject = {
							file_base64: base64File,
							filename: binaryData.fileName || 'file',
							target_format: targetFormat,
						};

						// Add additional fields
						if (outputFilename) {
							body.output_filename = outputFilename;
						}
						if (additionalFields.webhook_url) {
							body.webhook_url = additionalFields.webhook_url;
						}

						// Add conversion options
						const conversionOptions: IDataObject = {};
						if (additionalFields.quality) conversionOptions.quality = additionalFields.quality;
						if (additionalFields.resolution) conversionOptions.resolution = additionalFields.resolution;
						if (additionalFields.bitrate) conversionOptions.bitrate = additionalFields.bitrate;
						if (additionalFields.sample_rate) conversionOptions.sample_rate = additionalFields.sample_rate;

						if (Object.keys(conversionOptions).length > 0) {
							body.options = conversionOptions;
						}

						// Add metadata
						if (additionalFields.metadata) {
							const metadataValues = (additionalFields.metadata as IDataObject)
								.metadataValues as IDataObject[];
							if (metadataValues) {
								const metadata: IDataObject = {};
								for (const item of metadataValues) {
									metadata[item.key as string] = item.value;
								}
								body.metadata = metadata;
							}
						}

						// Make the API request
						let response;
						try {
							response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'converthubApi',
								{
									method: 'POST',
									url: 'https://api.converthub.com/v2/convert/base64',
									body,
									json: true,
								},
							);
						} catch (error) {
							// Network or other error
							throw new NodeOperationError(this.getNode(), `Failed to connect to API: ${error.message}`, { itemIndex: i });
						}

						// Check if the request was successful
						const success = (response as IDataObject).success;
						if (success === false) {
							// Validation error or immediate failure - don't poll
							const errorObj = (response as IDataObject).error;
							let errorMessage = 'Conversion request failed';

							if (errorObj && typeof errorObj === 'object') {
								errorMessage = (errorObj as IDataObject).message as string;
							}
							throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
						}

						// Poll for job completion and download the file
						const jobId = (response as IDataObject).job_id as string;
						const completedResponse = await pollForCompletion(jobId, true, outputBinaryPropertyName, i, outputFilename);
						returnData.push(completedResponse);
					} else if (operation === 'convertUrl') {
						const fileUrl = this.getNodeParameter('fileUrl', i) as string;
						const targetFormat = this.getNodeParameter('targetFormat', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const outputBinaryPropertyName = (options.binaryPropertyName as string) || 'data';

						const body: IDataObject = {
							file_url: fileUrl,
							target_format: targetFormat,
						};

						// Generate output filename from URL if not provided
						let outputFilename = additionalFields.output_filename as string | undefined;
						if (!outputFilename) {
							try {
								// Extract filename from URL
								const urlPath = new URL(fileUrl).pathname;
								const urlFilename = urlPath.split('/').pop() || 'file';
								// Remove existing extension and add new one
								const baseName = urlFilename.replace(/\.[^/.]+$/, '');
								outputFilename = `${baseName}.${targetFormat}`;
							} catch {
								// If URL parsing fails, use a default name
								outputFilename = `converted.${targetFormat}`;
							}
						}

						// Add additional fields
						if (outputFilename) {
							body.output_filename = outputFilename;
						}
						if (additionalFields.webhook_url) {
							body.webhook_url = additionalFields.webhook_url;
						}

						// Add conversion options
						const conversionOptions: IDataObject = {};
						if (additionalFields.quality) conversionOptions.quality = additionalFields.quality;
						if (additionalFields.resolution)
							conversionOptions.resolution = additionalFields.resolution;
						if (additionalFields.bitrate) conversionOptions.bitrate = additionalFields.bitrate;
						if (additionalFields.sample_rate)
							conversionOptions.sample_rate = additionalFields.sample_rate;

						if (Object.keys(conversionOptions).length > 0) {
							body.options = conversionOptions;
						}

						// Add metadata
						if (additionalFields.metadata) {
							const metadata: IDataObject = {};
							const metadataValues = (additionalFields.metadata as IDataObject)
								.metadataValues as IDataObject[];
							if (metadataValues) {
								for (const item of metadataValues) {
									metadata[item.key as string] = item.value;
								}
							}
							if (Object.keys(metadata).length > 0) {
								body.metadata = metadata;
							}
						}

						let response;
						try {
							response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'converthubApi',
								{
									method: 'POST',
									url: 'https://api.converthub.com/v2/convert-url',
									body,
									json: true,
									ignoreHttpStatusErrors: true,
								},
							);
						} catch (error) {
							// Network or other error
							throw new NodeOperationError(this.getNode(), `Failed to connect to API: ${error.message}`);
						}

						// Check if the request was successful
						const success = (response as IDataObject).success;
						if (success === false) {
							// Validation error or immediate failure - don't poll
							const errorObj = (response as IDataObject).error;
							let errorMessage = 'Conversion request failed';

							if (errorObj && typeof errorObj === 'object') {
								errorMessage = (errorObj as IDataObject).message as string;
							}
							throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
						}

						// Poll for job completion and download the file
						const jobId = (response as IDataObject).job_id as string;
						const completedResponse = await pollForCompletion(jobId, true, outputBinaryPropertyName, i, outputFilename);
						returnData.push(completedResponse);
					} else if (operation === 'getStatus') {
						const jobId = this.getNodeParameter('jobId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: `https://api.converthub.com/v2/jobs/${jobId}`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'getDownloadUrl') {
						const jobId = this.getNodeParameter('jobId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: `https://api.converthub.com/v2/jobs/${jobId}/download`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'cancelJob') {
						const jobId = this.getNodeParameter('jobId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'DELETE',
								url: `https://api.converthub.com/v2/jobs/${jobId}`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'deleteConversion') {
						const jobId = this.getNodeParameter('jobId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'DELETE',
								url: `https://api.converthub.com/v2/jobs/${jobId}/destroy`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					}
				} else if (resource === 'formats') {
					if (operation === 'getAllFormats') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: 'https://api.converthub.com/v2/formats',
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'getFormatConversions') {
						const format = this.getNodeParameter('format', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: `https://api.converthub.com/v2/formats/${format}/conversions`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'checkConversionSupport') {
						const sourceFormat = this.getNodeParameter('sourceFormat', i) as string;
						const targetFormat = this.getNodeParameter('targetFormat', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: `https://api.converthub.com/v2/formats/${sourceFormat}/to/${targetFormat}`,
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					} else if (operation === 'getAllConversions') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: 'https://api.converthub.com/v2/formats/supported-conversions',
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					}
				} else if (resource === 'account') {
					if (operation === 'getDetails') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'converthubApi',
							{
								method: 'GET',
								url: 'https://api.converthub.com/v2/account',
								json: true,
							},
						);

						returnData.push({ json: response as IDataObject });
					}
				}
			} catch (error) {
				// Try to extract a meaningful error message from API responses
				let errorMessage = error.message;

				if (error.response?.body) {
					const errorBody = error.response.body;

					// Check if error is an object with message property
					if (errorBody.error && typeof errorBody.error === 'object' && errorBody.error.message) {
						errorMessage = errorBody.error.message;
					} else if (typeof errorBody.error === 'string') {
						errorMessage = errorBody.error;
					} else if (errorBody.message) {
						errorMessage = errorBody.message;
					} else if (errorBody.errors) {
						errorMessage = JSON.stringify(errorBody.errors);
					}
				}

				if (this.continueOnFail()) {
					returnData.push({ json: { error: errorMessage }, pairedItem: { item: i } });
					continue;
				}

				// Throw error with the extracted message
				throw new NodeOperationError(this.getNode(), errorMessage);
			}
		}

		return [returnData];
	}
}
