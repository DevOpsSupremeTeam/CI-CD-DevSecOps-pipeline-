FROM node:20-alpine

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8002

CMD ["node", "--require", "./instrumentation.js", "src/index.js"]