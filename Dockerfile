FROM node:24-bookworm-slim AS frontend
WORKDIR /app/frontend
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app/backend
ENV NODE_ENV=production PORT=5000 SERVE_STATIC=true
COPY backend/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force
COPY backend/src ./src
COPY --from=frontend /app/frontend/dist /app/frontend/dist
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
