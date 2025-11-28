# Ky OpenAPI Generator

Generate fully-typed HTTP clients for your APIs directly from OpenAPI specifications using **ky.js**.

## Features

- 🚀 **Automatic Code Generation** - Generate TypeScript HTTP clients from OpenAPI specs
- 📝 **Full Type Safety** - Generate complete TypeScript interfaces for requests and responses
- 🎯 **Ky.js Integration** - Uses the lightweight ky.js HTTP client
- ⚙️ **Flexible Configuration** - Customize base URLs, client names, and more
- 🛠️ **CLI Interface** - Easy-to-use command-line tool
- 📦 **Zero Dependencies** - Only requires ky.js at runtime

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
  baseUrl?: string;           // Base URL for API
  clientName?: string;        // Name of generated class
  typesOnly?: boolean;        // Generate types only
  exportAsDefault?: boolean;  // Default export
}
```

## Development

### Setup

```bash
npm install
npm run build
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Generate Example

```bash
npm run gen:example:build
```

## Project Structure

```
ky-openapi-generator/
├── src/
│   ├── types.ts          # Type definitions
│   ├── parser.ts         # OpenAPI parser
│   ├── generator.ts      # Code generator
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
