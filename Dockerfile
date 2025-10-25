### Multi-stage Dockerfile for aalacomputer
### Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# install deps and build frontend into backend/dist
COPY package.json package-lock.json ./
RUN npm ci --silent

# copy source and run build
COPY . .
RUN npm run build --silent

### Production image
FROM node:18-alpine
WORKDIR /app

# only copy built frontend and backend server
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/index.cjs ./backend/index.cjs

# copy package metadata and install only production deps
COPY package.json package-lock.json ./
RUN npm ci --production --silent

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "backend/index.cjs"]
