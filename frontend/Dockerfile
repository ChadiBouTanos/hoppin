# STEP 1 — Build frontend
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# STEP 2 — Serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
