#========================================================================================================
#Step 1: Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY ../audio-recorder/package*.json ./
RUN npm install

# Copy project files
# Copy all required project files
COPY ../audio-recorder/app ./app
COPY ../audio-recorder/public ./public
COPY ../audio-recorder/tsconfig.json ./tsconfig.json
COPY ../audio-recorder/postcss.config.mjs ./postcss.config.mjs
COPY ../audio-recorder/tailwind.config.ts ./tailwind.config.ts
COPY ../audio-recorder/next.config.mjs ./next.config.mjs

# Build Next.js app
RUN npm run build

# Step 2: Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Install serve to serve the Next.js app
RUN npm install -g serve

# Copy the built files from the previous stage
COPY --from=build /app ./

# Expose the port for the Next.js app
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
