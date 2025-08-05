FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy source code
COPY . .

# Install dependencies and build
RUN npm install && npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 