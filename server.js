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
      'POST /api/mcp/tools/call': 'MCP tools/call endpoint',
      'GET /policy': 'Privacy policy and terms of service'
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

// Privacy Policy endpoint
app.get('/policy', (req, res) => {
  res.json({
    privacy_policy: {
      title: 'UniTrack MCP Server - Privacy Policy & Terms of Service',
      last_updated: '2025-08-05',
      version: '1.0.0',
      
      overview: {
        description: 'This privacy policy explains how UniTrack MCP Server collects, uses, and protects your information when you use our shipment tracking API.',
        service: 'UniTrack MCP Server is a universal tracking service that provides shipment tracking across multiple providers including ProShip, Shipway, and others.'
      },
      
      information_collection: {
        title: 'Information We Collect',
        description: 'We collect minimal information necessary to provide our tracking services:',
        data_collected: [
          'Tracking numbers you submit for tracking',
          'IP addresses for security and abuse prevention',
          'Usage analytics (request frequency, response times)',
          'Error logs for service improvement'
        ],
        data_not_collected: [
          'Personal identification information',
          'Payment information',
          'Address details',
          'Phone numbers or email addresses'
        ]
      },
      
      data_usage: {
        title: 'How We Use Your Information',
        description: 'Your information is used solely for:',
        purposes: [
          'Providing shipment tracking services',
          'Improving API performance and reliability',
          'Preventing abuse and security threats',
          'Technical support and debugging'
        ]
      },
      
      data_sharing: {
        title: 'Data Sharing and Third Parties',
        description: 'We may share data in the following circumstances:',
        sharing_scenarios: [
          'With shipping providers (ProShip, Shipway) to retrieve tracking information',
          'With hosting providers (Render) for service delivery',
          'When required by law or legal process',
          'To protect our rights and prevent abuse'
        ],
        no_selling: 'We do not sell, rent, or trade your personal information to third parties.'
      },
      
      data_retention: {
        title: 'Data Retention',
        description: 'We retain data for the following periods:',
        retention_periods: {
          'Tracking requests': '30 days',
          'Error logs': '90 days',
          'Usage analytics': '1 year',
          'IP addresses': '7 days'
        }
      },
      
      security: {
        title: 'Data Security',
        description: 'We implement appropriate security measures:',
        measures: [
          'HTTPS encryption for all API communications',
          'Secure hosting infrastructure',
          'Regular security updates',
          'Access controls and monitoring'
        ]
      },
      
      api_usage: {
        title: 'API Usage Terms',
        description: 'By using our API, you agree to:',
        terms: [
          'Use the API for legitimate tracking purposes only',
          'Respect rate limits and fair use policies',
          'Not attempt to reverse engineer or abuse the service',
          'Comply with applicable laws and regulations'
        ],
        rate_limits: {
          'Free tier': '1000 requests per hour',
          'Commercial use': 'Contact for custom limits'
        }
      },
      
      user_rights: {
        title: 'Your Rights',
        description: 'You have the right to:',
        rights: [
          'Request information about data we hold about you',
          'Request deletion of your data',
          'Opt out of analytics collection',
          'Report security concerns'
        ]
      },
      
      cookies: {
        title: 'Cookies and Tracking',
        description: 'We use minimal cookies and tracking:',
        usage: [
          'Session cookies for web interface functionality',
          'Analytics cookies for service improvement',
          'No third-party advertising cookies'
        ]
      },
      
      children: {
        title: 'Children\'s Privacy',
        description: 'Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.'
      },
      
      international: {
        title: 'International Data Transfers',
        description: 'Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.'
      },
      
      changes: {
        title: 'Changes to This Policy',
        description: 'We may update this privacy policy from time to time. We will notify users of significant changes via API documentation updates.'
      },
      
      contact: {
        title: 'Contact Information',
        description: 'For privacy-related questions or concerns:',
        contact_methods: [
          'Email: privacy@unitrack-mcp.com',
          'GitHub Issues: https://github.com/sachinhub/unitrack/issues',
          'API Documentation: /'
        ]
      },
      
      legal: {
        title: 'Legal Information',
        description: 'This service is provided "as is" without warranties. We are not responsible for tracking information accuracy provided by third-party providers.',
        jurisdiction: 'This policy is governed by applicable data protection laws.'
      }
    }
  });
});

app.listen(port, () => {
  console.log(`UniTrack MCP Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API docs: http://localhost:${port}/`);
}); 