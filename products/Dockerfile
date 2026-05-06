FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

FROM node:20-alpine

WORKDIR /app/products

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/node_modules ./node_modules

COPY --chown=node:node . .

USER node

EXPOSE 8002

CMD ["node", "--require", "./instrumentation.js", "src/index.js"]