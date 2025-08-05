# UniTrack MCP Server - Google Cloud Run Deployment Guide

## 🚀 Deploy to Google Cloud Run (FREE TIER)

Google Cloud Run offers an excellent free tier for hosting your UniTrack MCP server:

### **Free Tier Benefits:**
- ✅ **2 million requests per month** (free)
- ✅ **360,000 vCPU-seconds** (free) 
- ✅ **180,000 GiB-seconds** (free)
- ✅ **1 GB network egress** (free)
- ✅ **Auto-scaling** to zero when not in use
- ✅ **Custom domains** support
- ✅ **HTTPS** by default

## 📋 Prerequisites

1. **Google Cloud Account** (free $300 credit for new users)
2. **Google Cloud CLI** installed
3. **Docker** (optional, for local testing)

## 🛠️ Setup Steps

### **Step 1: Install Google Cloud CLI**

**macOS:**
```bash
brew install google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
Download from: https://cloud.google.com/sdk/docs/install

### **Step 2: Authenticate and Setup Project**

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create unitrack-mcp-server --name="UniTrack MCP Server"

# Set the project
gcloud config set project unitrack-mcp-server

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### **Step 3: Enable Required APIs**

```bash
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deployment Options

### **Option 1: Quick Deploy (Recommended)**

```bash
# Make the deployment script executable
chmod +x gcp-deploy.sh

# Run the deployment
./gcp-deploy.sh
```

### **Option 2: Manual Deploy**

```bash
# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### **Option 3: Direct Cloud Run Deploy**

```bash
# Build the Docker image
docker build -t gcr.io/$(gcloud config get-value project)/unitrack-mcp-server .

# Push to Container Registry
docker push gcr.io/$(gcloud config get-value project)/unitrack-mcp-server

# Deploy to Cloud Run
gcloud run deploy unitrack-mcp-server \
  --image gcr.io/$(gcloud config get-value project)/unitrack-mcp-server \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

## 🌐 After Deployment

Your service will be available at:
- **Service URL**: `https://unitrack-mcp-server-xxxxx-uc.a.run.app`
- **Health Check**: `https://your-service-url/health`
- **Web Interface**: `https://your-service-url/`
- **API**: `https://your-service-url/api/track`

## 🧪 Testing Your Deployment

```bash
# Health check
curl https://your-service-url/health

# Track a shipment
curl -X POST https://your-service-url/api/track \
  -H "Content-Type: application/json" \
  -d '{"tracking_number": "PRVP0000230127"}'

# Get providers
curl https://your-service-url/api/providers
```

## 💰 Cost Optimization

### **Free Tier Limits:**
- **2 million requests/month** (free)
- **360,000 vCPU-seconds/month** (free)
- **180,000 GiB-seconds/month** (free)

### **Cost Control:**
```bash
# Set maximum instances to control costs
gcloud run services update unitrack-mcp-server \
  --max-instances 5 \
  --region us-central1

# Set memory limit
gcloud run services update unitrack-mcp-server \
  --memory 256Mi \
  --region us-central1
```

## 🔧 Configuration Options

### **Environment Variables:**
```bash
gcloud run services update unitrack-mcp-server \
  --set-env-vars NODE_ENV=production \
  --region us-central1
```

### **Custom Domain:**
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service unitrack-mcp-server \
  --domain your-domain.com \
  --region us-central1
```

### **SSL Certificate:**
- HTTPS is **enabled by default** on Cloud Run
- No additional configuration needed

## 📊 Monitoring

### **View Logs:**
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=unitrack-mcp-server" --limit=50
```

### **View Metrics:**
- Go to [Cloud Run Console](https://console.cloud.google.com/run)
- Select your service
- View metrics and logs

## 🔄 Continuous Deployment

### **Setup GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Deploy to Cloud Run
      run: |
        gcloud builds submit --config cloudbuild.yaml .
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **Build Failures:**
   ```bash
   # Check build logs
   gcloud builds log BUILD_ID
   ```

2. **Service Not Starting:**
   ```bash
   # Check service logs
   gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=unitrack-mcp-server"
   ```

3. **Permission Errors:**
   ```bash
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
     --member="serviceAccount:$(gcloud config get-value project)@cloudbuild.gserviceaccount.com" \
     --role="roles/run.admin"
   ```

### **Health Check Failures:**
- Ensure `/health` endpoint returns 200
- Check service is listening on port 3000
- Verify environment variables are set correctly

## 🎯 Benefits of Google Cloud Run

✅ **Serverless** - No server management  
✅ **Auto-scaling** - Scales to zero when not in use  
✅ **Pay-per-use** - Only pay for actual usage  
✅ **Global CDN** - Fast worldwide access  
✅ **HTTPS by default** - Secure connections  
✅ **Custom domains** - Professional URLs  
✅ **Free tier** - Generous limits  

## 📞 Support

- **Google Cloud Documentation**: https://cloud.google.com/run/docs
- **Cloud Run Pricing**: https://cloud.google.com/run/pricing
- **Free Tier Details**: https://cloud.google.com/free

Your UniTrack MCP server is now ready for production deployment on Google Cloud Run! 🎉 