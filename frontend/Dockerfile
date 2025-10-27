FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle React 19
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Copy .env file if it exists (for build-time environment variables)
COPY .env* ./

# Build the project
RUN npm run build

# The build output will be in /app/dist
# We'll use a volume to share it with nginx