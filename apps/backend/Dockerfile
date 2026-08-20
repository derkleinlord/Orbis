FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY apps/backend apps/backend
RUN npm run build -w apps/backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev
COPY --from=build /app/apps/backend/dist apps/backend/dist
CMD ["node", "apps/backend/dist/server.js"]
