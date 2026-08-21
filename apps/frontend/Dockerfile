FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY apps/frontend apps/frontend
RUN npm run build -w apps/frontend

FROM nginx:1.27-alpine
COPY deploy/nginx/orbis.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
