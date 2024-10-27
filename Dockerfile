# Step 1: Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY ../audio-recorder/package*.json ./
RUN npm install

# Copy project files
COPY ../audio-recorder/app ./app
COPY ../audio-recorder/public ./public
COPY ../audio-recorder/tsconfig.json ./tsconfig.json
COPY ../audio-recorder/postcss.config.mjs ./postcss.config.mjs
COPY ../audio-recorder/tailwind.config.ts ./tailwind.config.ts
COPY ../audio-recorder/next.config.js ./next.config.js

# Set environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=http://54.208.12.34/api
ENV NEXT_PUBLIC_FRONTEND_URL=http://54.208.12.34
ENV NEXT_PUBLIC_WEBSOCKET_URL=ws://54.208.12.34/api
ENV NODE_ENV=production

# Build Next.js app
RUN npm run build

# Step 2: Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set runtime environment variables
ENV NEXT_PUBLIC_BACKEND_URL=http://54.208.12.34/api
ENV NEXT_PUBLIC_FRONTEND_URL=http://54.208.12.34
ENV NEXT_PUBLIC_WEBSOCKET_URL=ws://54.208.12.34/api

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]