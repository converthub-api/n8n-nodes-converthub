# n8n-nodes-converthub

This is an n8n community node that lets you use [ConvertHub](https://converthub.com) in your n8n workflows.

ConvertHub is a powerful file conversion API that supports 800+ format conversion pairs across images, documents, audio, video, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)
- [Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

use the Community Nodes menu in n8n:

1. Go to **Settings** > **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-converthub` in the **Enter npm package name** field
4. Click **Install**

## Operations

This node supports the following operations:

### Conversion Resource
- **Convert File** - Convert a file from one format to another (supports binary data)
- **Convert from URL** - Convert a file by providing its URL

### Formats Resource
- **Get All Supported Formats** - Get a list of all supported file formats grouped by type
- **Get Format Conversions** - Get available conversions for a specific format
- **Check Conversion Support** - Check if a specific conversion is supported
- **Get All Supported Conversions** - Get all supported formats with conversion mappings

### Account Resource
- **Get Account Details** - Get account information including credits, plan details, and file size limits

## Credentials

To use this node, you need a ConvertHub API key:

1. Sign up for a developer account at [ConvertHub API Signup](https://converthub.com/api/signup)
2. Navigate to your dashboard
3. Generate a new API key in the API Keys section
4. Copy your API key

### Setting up credentials in n8n:

1. In n8n, go to **Credentials** > **New**
2. Search for "ConvertHub API"
3. Enter your API key in the **API Key** field
4. Click **Save**

**Note:** All API requests require authentication. Keep your API key secure and never expose it in client-side code.

## Compatibility

- Minimum n8n version: 1.0.0
- Tested against n8n version: 1.117.3

## Usage

### Example 1: Convert an Image

This example shows how to convert a PNG image to JPG:

1. Use an **HTTP Request** node or **Read Binary File** node to get your source file
2. Add the **ConvertHub** node
3. Select **Conversion** as the resource
4. Select **Convert File** as the operation
5. Set **Binary Property** to `data` (or your binary property name)
6. Set **Target Format** to `jpg`
7. Optionally, add quality settings in **Additional Fields**
8. Execute the workflow
9. 
### Example 2: Convert from URL

1. Add a **ConvertHub** node
2. Select **Conversion** as the resource
3. Select **Convert from URL** as the operation
4. Enter the file URL (e.g., `https://example.com/document.pdf`)
5. Set **Target Format** to `docx`
6. Execute the workflow

### Example 3: Check Supported Formats

1. Add a **ConvertHub** node
2. Select **Formats** as the resource
3. Select **Get All Supported Formats** as the operation
4. Execute to see all supported format groups

### Example 4: Check Account Credits

1. Add a **ConvertHub** node
2. Select **Account** as the resource
3. Select **Get Account Details** as the operation
4. Execute to see your remaining credits and plan details

### Conversion Options

The **Convert File** and **Convert from URL** operations support these optional parameters:

- **Output Filename** - Custom name for the output file
- **Webhook URL** - URL to receive webhook notification when conversion completes
- **Quality** - Quality setting (1-100) for lossy formats like JPEG, MP3
- **Resolution** - Resolution for image/video conversions (e.g., "1920x1080")
- **Bitrate** - Bitrate for audio/video conversions (e.g., "320k")
- **Sample Rate** - Sample rate for audio conversions (e.g., 44100)
- **Metadata** - Custom key-value pairs for tracking purposes

## API Limits

- **File Size Limit**: 50MB for direct upload
- **Rate Limits**: Varies by plan (see API documentation)
- **File Retention**: Converted files are available for 24 hours
- **Credits**: Each conversion consumes 1 credit

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [ConvertHub API Documentation](https://converthub.com/api/docs)
* [ConvertHub Website](https://converthub.com/api)
* [GitHub Repository](https://github.com/converthub-api/n8n-nodes-converthub)

## Version history

### 0.1.0 (Current)

- Initial release
- Support for file conversion (direct upload and URL-based)
- Support for job management (status, cancel, delete)
- Support for format discovery endpoints
- Support for account information endpoint
- Support for 800+ format conversion pairs
- Full API v2 coverage

## License

[MIT](LICENSE.md)

## Support

For issues and questions:
- Email: support@converthub.com
- GitHub Issues: [Report an issue](https://github.com/converthub-api/n8n-nodes-converthub/issues)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
