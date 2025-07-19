# UniTrack MCP Server

Universal tracking MCP server for shipment tracking across multiple providers.

## Features

- Universal interface for tracking shipments
- Automatic provider detection based on tracking number format
- Currently supports ProShip tracking
- Built as an MCP (Model Context Protocol) server

## Installation

```bash
npm install
npm run build
```

## Usage as MCP Server

The server provides two tools:

1. `track_shipment` - Track a shipment by tracking number
2. `get_supported_providers` - Get list of supported providers

### Example MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "unitrack": {
      "command": "node",
      "args": ["/path/to/unitrack/dist/index.js"]
    }
  }
}
```

## Supported Providers

- **ProShip**: Tracking numbers starting with "PRV" (e.g., PRVP0000230128)

## Testing

```bash
node test.js
```

## Adding New Providers

1. Create a new provider class implementing `TrackingProvider` interface
2. Add it to the providers array in `src/tracker.ts`
3. Implement the `identify()` method for pattern matching
4. Implement the `track()` method for fetching tracking data

## API

### TrackingResult Format

```typescript
{
  trackingNumber: string;
  provider: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
  success: boolean;
  error?: string;
}
```