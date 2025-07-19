#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { UniversalTracker } from './tracker.js';

const server = new Server(
  {
    name: 'unitrack-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tracker = new UniversalTracker();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'track_shipment',
        description: 'Track a shipment using its tracking number. Automatically detects the shipping provider and returns detailed tracking information.',
        inputSchema: {
          type: 'object',
          properties: {
            tracking_number: {
              type: 'string',
              description: 'The tracking number to track (e.g., PRVP0000230128 for ProShip)',
            },
          },
          required: ['tracking_number'],
        },
      },
      {
        name: 'get_supported_providers',
        description: 'Get a list of all supported shipping providers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'track_shipment': {
        const { tracking_number } = args as { tracking_number: string };
        
        if (!tracking_number) {
          throw new Error('Tracking number is required');
        }

        const result = await tracker.track(tracking_number);
        
        const formattedResult = {
          tracking_number: result.trackingNumber,
          provider: result.provider,
          status: result.status,
          current_location: result.currentLocation || 'Unknown',
          estimated_delivery: result.estimatedDelivery || 'Not available',
          events: result.events.map(event => ({
            timestamp: event.timestamp,
            status: event.status,
            location: event.location,
            description: event.description
          })),
          success: result.success,
          error: result.error
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formattedResult, null, 2),
            },
          ],
        };
      }

      case 'get_supported_providers': {
        const providers = tracker.getSupportedProviders();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                supported_providers: providers,
                total_count: providers.length
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UniTrack MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});