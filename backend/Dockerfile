FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
