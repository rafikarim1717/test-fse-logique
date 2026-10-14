FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG NUXT_PUBLIC_API_BASE=http://localhost:3001
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
RUN npm run generate

FROM nginx:alpine
COPY --from=build /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80