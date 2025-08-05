import express from 'express';
import { UniversalTracker } from './dist/tracker.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

const tracker = new UniversalTracker();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniTrack MCP Server is running' });
});

// Get supported providers
app.get('/api/providers', (req, res) => {
  try {
    const providers = tracker.getSupportedProviders();
    res.json({
      supported_providers: providers,
      total_count: providers.length
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Track shipment endpoint
app.post('/api/track', async (req, res) => {
  try {
    const { tracking_number } = req.body;
    
    if (!tracking_number) {
      return res.status(400).json({
        error: 'Tracking number is required',
        success: false
      });
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

    res.json(formattedResult);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// MCP-compatible endpoint for tools/list
app.post('/api/mcp/tools/list', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    id: req.body.id || 1,
    result: {
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
    }
  });
});

// MCP-compatible endpoint for tools/call
app.post('/api/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body.params;

    switch (name) {
      case 'track_shipment': {
        const { tracking_number } = args;
        
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

        res.json({
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(formattedResult, null, 2),
              },
            ],
          }
        });
        break;
      }

      case 'get_supported_providers': {
        const providers = tracker.getSupportedProviders();
        
        res.json({
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  supported_providers: providers,
                  total_count: providers.length
                }, null, 2),
              },
            ],
          }
        });
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    res.json({
      jsonrpc: "2.0",
      id: req.body.id,
      result: {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      }
    });
  }
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'UniTrack MCP Server',
    version: '1.0.0',
    description: 'Universal tracking MCP server for shipment tracking across multiple providers',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /api/providers': 'Get supported shipping providers',
      'POST /api/track': 'Track a shipment (send tracking_number in body)',
      'POST /api/mcp/tools/list': 'MCP tools/list endpoint',
      'POST /api/mcp/tools/call': 'MCP tools/call endpoint'
    },
    example: {
      track_shipment: {
        method: 'POST',
        url: '/api/track',
        body: { tracking_number: 'PRVP0000230127' }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`UniTrack MCP Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API docs: http://localhost:${port}/`);
}); 