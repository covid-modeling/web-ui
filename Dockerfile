FROM node:13-alpine

WORKDIR /app
COPY script script
COPY package*.json ./
RUN npm ci

CMD ["npm", "run", "dev"]
