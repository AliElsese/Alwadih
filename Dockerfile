# --- Stage 1: Build the Application ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for building)
RUN npm install

# Copy source files
COPY . .

# Build the NestJS application (outputs to ./dist)
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled code from the build stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Use non-root node user for better security
USER node

# Start the application
CMD ["node", "dist/main"]