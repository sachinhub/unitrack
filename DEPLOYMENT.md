# UniTrack MCP Server - Deployment Guide

## Deploy to Render

### Option 1: Deploy via Render Dashboard

1. **Fork/Clone this repository** to your GitHub account
2. **Go to [Render Dashboard](https://dashboard.render.com/)**
3. **Click "New +"** and select "Web Service"
4. **Connect your GitHub repository**
5. **Configure the service:**
   - **Name**: `unitrack-mcp-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### Option 2: Deploy via render.yaml (Blueprints)

1. **Push this repository** to GitHub
2. **Go to [Render Dashboard](https://dashboard.render.com/)**
3. **Click "New +"** and select "Blueprint"
4. **Connect your GitHub repository**
5. **Render will automatically detect the `render.yaml`** and deploy

### Option 3: Deploy via Docker

1. **Build the Docker image:**
   ```bash
   docker build -t unitrack-mcp-server .
   ```

2. **Run locally:**
   ```bash
   docker run -p 3000:3000 unitrack-mcp-server
   ```

3. **Deploy to Render with Docker:**
   - Use the Dockerfile in this repository
   - Render will automatically build and deploy

## Environment Variables

The following environment variables can be configured in Render:

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Port number (default: 3000, Render sets this automatically)

## API Endpoints

Once deployed, your service will be available at:

- **Health Check**: `https://your-app-name.onrender.com/health`
- **API Documentation**: `https://your-app-name.onrender.com/`
- **Track Shipment**: `POST https://your-app-name.onrender.com/api/track`
- **Get Providers**: `GET https://your-app-name.onrender.com/api/providers`
- **MCP Tools List**: `POST https://your-app-name.onrender.com/api/mcp/tools/list`
- **MCP Tools Call**: `POST https://your-app-name.onrender.com/api/mcp/tools/call`

## Testing the Deployment

1. **Health Check:**
   ```bash
   curl https://your-app-name.onrender.com/health
   ```

2. **Track a Shipment:**
   ```bash
   curl -X POST https://your-app-name.onrender.com/api/track \
     -H "Content-Type: application/json" \
     -d '{"tracking_number": "PRVP0000230127"}'
   ```

3. **Get Supported Providers:**
   ```bash
   curl https://your-app-name.onrender.com/api/providers
   ```

## Web Interface

Visit `https://your-app-name.onrender.com/` to use the web interface for testing tracking functionality.

## Troubleshooting

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Runtime Errors**: Check the Render logs in the dashboard
3. **Health Check Failures**: Ensure the `/health` endpoint is working
4. **API Errors**: Verify the tracking providers are accessible

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run the web server
npm start

# Run the MCP server
npm run mcp
``` 