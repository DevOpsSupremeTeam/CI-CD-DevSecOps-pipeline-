FROM node:20-alpine

WORKDIR /app/shopping

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8003

CMD ["node", "--require", "./instrumentation.js", "src/index.js"]