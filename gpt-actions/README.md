# UniTrack MCP Server - GPT Action Schemas

This directory contains OpenAPI schemas for each API endpoint that can be used to configure custom GPT actions.

## 📁 Available Schemas

### 1. **Track Shipment** (`track-shipment.yaml`)
- **Purpose**: Track a shipment using its tracking number
- **Method**: POST
- **Endpoint**: `/api/track`
- **Input**: `tracking_number` (string)
- **Output**: Detailed tracking information with events

### 2. **Get Providers** (`get-providers.yaml`)
- **Purpose**: Get list of supported shipping providers
- **Method**: GET
- **Endpoint**: `/api/providers`
- **Input**: None
- **Output**: Array of supported provider names

### 3. **Health Check** (`health-check.yaml`)
- **Purpose**: Check if the server is running and healthy
- **Method**: GET
- **Endpoint**: `/health`
- **Input**: None
- **Output**: Server health status

### 4. **Privacy Policy** (`privacy-policy.yaml`)
- **Purpose**: Get comprehensive privacy policy and terms
- **Method**: GET
- **Endpoint**: `/policy`
- **Input**: None
- **Output**: Complete privacy policy information

## 🚀 How to Use with GPT Actions

### **Option 1: Individual Endpoints**

Use individual schemas for specific functionality:

```yaml
# For tracking shipments only
openapi: 3.1.0
info:
  title: Track Shipment
  description: Track shipments with tracking numbers
servers:
  - url: https://unitrack-1-gmk0.onrender.com
paths:
  /api/track:
    post:
      # ... (use track-shipment.yaml content)
```

### **Option 2: Complete API**

Use the main `openapi.yaml` for full API access:

```yaml
# For complete API access
openapi: 3.1.0
info:
  title: UniTrack MCP Server API
  description: Universal tracking MCP server
servers:
  - url: https://unitrack-1-gmk0.onrender.com
paths:
  # ... (all endpoints)
```

## 🎯 GPT Action Configuration

### **Step 1: Choose Your Schema**

Select the appropriate schema based on your needs:

- **Single Function**: Use individual schemas (e.g., `track-shipment.yaml`)
- **Full API**: Use `openapi.yaml` for complete access

### **Step 2: Configure GPT Action**

1. **Go to GPT Builder**: https://chat.openai.com/gpts/editor
2. **Add Action**: Click "Add action"
3. **Import Schema**: Paste the OpenAPI schema content
4. **Test**: Verify the action works correctly

### **Step 3: Example Usage**

```javascript
// Example GPT action call
const response = await fetch('https://unitrack-1-gmk0.onrender.com/api/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tracking_number: 'PRVP0000230127'
  })
});

const result = await response.json();
console.log(result);
```

## 📋 Schema Details

### **Track Shipment Schema**
```yaml
# Input
{
  "tracking_number": "PRVP0000230127"
}

# Output
{
  "tracking_number": "PRVP0000230127",
  "provider": "ProShip",
  "status": "Delivered",
  "current_location": "BhadravathiHub_BVT Bhadravathi",
  "estimated_delivery": "2025-07-18",
  "events": [...],
  "success": true
}
```

### **Get Providers Schema**
```yaml
# Input
{}

# Output
{
  "supported_providers": ["ProShip", "Shipway"],
  "total_count": 2
}
```

### **Health Check Schema**
```yaml
# Input
{}

# Output
{
  "status": "ok",
  "message": "UniTrack MCP Server is running"
}
```

## 🔧 Customization

### **Update Server URL**

Replace the server URL in any schema:

```yaml
servers:
  - url: https://your-custom-domain.com
    description: Your custom server
```

### **Add Authentication**

If you add authentication later:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### **Rate Limiting**

The API includes rate limiting:
- **Free tier**: 1000 requests per hour
- **Commercial use**: Contact for custom limits

## 🌐 Production URLs

### **Render Deployment**
- **Production**: `https://unitrack-1-gmk0.onrender.com`
- **Health Check**: `https://unitrack-1-gmk0.onrender.com/health`
- **API Docs**: `https://unitrack-1-gmk0.onrender.com/`

### **Local Development**
- **Local**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`

## 📞 Support

- **GitHub Issues**: https://github.com/sachinhub/unitrack/issues
- **API Documentation**: `https://unitrack-1-gmk0.onrender.com/`
- **Privacy Policy**: `https://unitrack-1-gmk0.onrender.com/policy`

## 🎉 Ready to Use!

Your UniTrack MCP Server is now ready for GPT action integration. Choose the appropriate schema and start building your custom GPT actions! 