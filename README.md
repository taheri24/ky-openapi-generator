# Ky OpenAPI Generator

Generate fully-typed HTTP clients for your APIs directly from OpenAPI specifications using **ky.js**.

## Features

- 🚀 **Automatic Code Generation** - Generate TypeScript HTTP clients from OpenAPI specs
- 📝 **Full Type Safety** - Generate complete TypeScript interfaces for requests and responses
- 🎯 **Ky.js Integration** - Uses the lightweight ky.js HTTP client
- ⚙️ **Flexible Configuration** - Customize base URLs, client names, and more
- 🛠️ **CLI Interface** - Easy-to-use command-line tool
- ✅ **File Integrity** - Optional checksum validation (CRC32, MD5, SHA1, SHA256) for input files
- 📦 **Zero Dependencies** - Only requires ky.js at runtime
- 🧠 **Smart Operation ID Suggestion** - Intelligently generates meaningful method names from API metadata
- 📦 **pnpm Ready** - Optimized for pnpm package manager with npm fallback support

## Installation

```bash
npm install ky-openapi-generator ky
```

Or use it directly with npx:

```bash
npx ky-openapi-generator <openapi-spec.json>
```

## Quick Start

### 1. Generate a Client

```bash
ky-openapi-gen openapi.json --output client.ts
```

### 2. Use the Generated Client

```typescript
import ApiClient from './client';

const client = new ApiClient('https://api.example.com');

// Call any generated endpoint
const response = await client.listPets({ limit: 10 });
console.log(response.data);
```

## CLI Usage

### Basic Command

```bash
ky-openapi-gen <spec-path> [options]
```

### Options

| Option | Shorthand | Description | Default |
|--------|-----------|-------------|---------|
| `--output <path>` | `-o` | Output file path (prints to stdout if not specified) | - |
| `--baseUrl <url>` | `-b` | Override base URL from spec | Spec's first server |
| `--clientName <name>` | `-c` | Name of generated client class | `ApiClient` |
| `--banner <text>` | - | Banner comment to prepend to generated file | - |
| `--checksum <method>` | - | Include file checksum (crc32, md5, sha1, sha256) | - |
| `--typesOnly` | `-t` | Generate only TypeScript types, no client class | `false` |
| `--help` | `-h` | Show help message | - |
| `--version` | `-v` | Show version | - |

### Examples

#### Generate client to stdout
```bash
ky-openapi-gen petstore.json
```

#### Generate client to file
```bash
ky-openapi-gen petstore.json --output ./src/api-client.ts
```

#### Custom base URL and client name
```bash
ky-openapi-gen petstore.json \
  --baseUrl https://api.example.com \
  --clientName PetstoreClient
```

#### Add a banner to the generated file
```bash
ky-openapi-gen petstore.json --output ./src/api-client.ts \
  --banner "Auto-generated code. Do not edit manually."
```

#### Include checksum for file integrity verification
```bash
# Using SHA256 checksum
ky-openapi-gen petstore.json --checksum sha256 --output ./src/api-client.ts

# Using MD5 checksum (default when flag is used)
ky-openapi-gen petstore.json --checksum md5 --output ./src/api-client.ts
```

#### Generate only TypeScript types
```bash
ky-openapi-gen petstore.json --typesOnly
```

## Programmatic Usage

```typescript
import { generateKyClient } from 'ky-openapi-generator';
import * as fs from 'fs';

const code = generateKyClient('openapi.json', {
  baseUrl: 'https://api.example.com',
  clientName: 'MyApiClient',
  banner: 'Auto-generated code. Do not edit manually.',
});

fs.writeFileSync('client.ts', code);
```

## Generated Client Structure

### Client Class

The generated client includes:

- **Constructor**: Accepts optional base URL
- **Methods**: One async method per API endpoint
- **Type Safety**: Full TypeScript interfaces for all requests/responses

### Example Generated Method

```typescript
async listPets(
  query?: ListPetsQuery,
  options?: RequestOptions
): Promise<ListPetsResponse> {
  const url = '/pets';
  const response = await this.ky.get(url, {
    searchParams: query,
    ...options,
  }).json<any>();
  return {
    data: response,
    status: 200,
    headers: {},
  };
}
```

### Generated Types

For each endpoint, the generator creates:

- **`{OperationName}Request`** - Request body interface
- **`{OperationName}Query`** - Query parameters interface
- **`{OperationName}Params`** - URL path parameters interface
- **`{OperationName}Response`** - Response interface
- **`RequestOptions`** - Common request options

## Example

See the `example/` directory for a complete working example using the Swagger Petstore API.

### Files

- `example/petstore.openapi.json` - Sample OpenAPI specification
- `example/generated-client.ts` - Generated client code
- `example/usage-example.ts` - Usage examples

## Smart Operation ID Suggestion

The generator includes an intelligent operation ID suggestion engine with three verbosity levels for generating meaningful method names:

- **Low**: Path-based naming → `GET /pets` becomes `getPets`
- **Medium**: Includes path parameters → `GET /pets/{petId}` becomes `getPetsPetid`
- **High**: Semantic keywords from descriptions → `GET /pets/{petId}` with "Info for a specific pet" becomes `getPetInfo`

This ensures every generated method has a clear, descriptive name that reflects its purpose, even when your OpenAPI spec lacks explicit operation IDs. The generator automatically detects and resolves naming conflicts across all levels, applying numeric suffixes only when necessary (e.g., `getUsers_1`, `getUsers_2`).

## Supported OpenAPI Features

✅ **Fully Supported:**
- Multiple HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
- Path parameters (`/pets/{petId}`)
- Query parameters
- Request bodies (JSON)
- Response types
- Operation IDs
- Tags and descriptions

⚠️ **Partially Supported:**
- Schema references (`$ref`)
- Complex schema types
- Header parameters

📋 **On Roadmap:**
- YAML OpenAPI specs
- Advanced schema validation
- Custom type mappings
- Response interceptors

## Architecture

The generator consists of three main components:

### 1. **Parser** (`src/parser.ts`)
- Reads and validates OpenAPI specifications
- Parses endpoints, parameters, and schemas
- Resolves schema references

### 2. **Generator** (`src/generator.ts`)
- Generates TypeScript code from parsed endpoints
- Creates type interfaces and client methods
- Handles path parameter substitution

### 3. **CLI** (`src/cli.ts`)
- Command-line interface
- File I/O and output handling
- Error handling and user feedback

## API Reference

### `generateKyClient(specPath: string, config?: GeneratorConfig): string`

Generates a Ky HTTP client from an OpenAPI specification.

**Parameters:**
- `specPath` (string) - Path to OpenAPI JSON file
- `config` (GeneratorConfig, optional) - Generation options

**Returns:**
- Generated TypeScript code as a string

**GeneratorConfig:**
```typescript
{
  baseUrl?: string;                      // Base URL for API
  clientName?: string;                   // Name of generated class
  typesOnly?: boolean;                   // Generate types only
  exportAsDefault?: boolean;             // Default export
  banner?: string;                       // Banner comment to prepend
  checksumMethod?: 'crc32' | 'md5' | 'sha1' | 'sha256';  // File checksum method
  inputFilePath?: string;                // Path to input OpenAPI spec file
}
```

## Development

### Quick Start with Make

Use the included Makefile for streamlined development workflows. Common commands: `make build`, `make test`, `make gen-example`, and for publishing: `make publish-check && make publish-dry && make publish`. See `MAKEFILE_GUIDE.md` for comprehensive documentation on all available targets and workflows.

### Setup

```bash
pnpm install  # or npm install for npm fallback
pnpm run build
```

### Build

```bash
pnpm run build
```

### Watch Mode

```bash
pnpm run dev
```

### Generate Example

```bash
pnpm run gen:example:build
```

### Run Tests

```bash
pnpm test
```

## Project Structure

```
ky-openapi-generator/
├── src/
│   ├── types.ts          # Type definitions
│   ├── parser.ts         # OpenAPI parser
│   ├── generator.ts      # Code generator
│   ├── checksum.ts       # Checksum utilities (CRC32, MD5, SHA1, SHA256)
│   ├── cli.ts            # CLI interface
│   └── index.ts          # Main exports
├── example/
│   ├── petstore.openapi.json    # Sample OpenAPI spec
│   ├── generated-client.ts      # Generated client
│   └── usage-example.ts         # Usage example
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

MIT

## Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Ky.js Documentation](https://github.com/sindresorhus/ky)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## Troubleshooting

### "Specification file not found"
- Ensure the path to your OpenAPI JSON file is correct
- Use absolute paths if relative paths don't work

### "Failed to parse specification file"
- Verify your OpenAPI file is valid JSON
- Use a JSON validator to check syntax

### Generated code has `any` types
- Add more detailed schemas to your OpenAPI specification
- Use schema references (`$ref`) for complex types

## Future Roadmap

- [ ] YAML OpenAPI spec support
- [ ] Advanced schema type mappings
- [ ] Request/response interceptors
- [ ] Automatic API documentation generation
- [ ] Mock server generation
- [ ] GraphQL support
