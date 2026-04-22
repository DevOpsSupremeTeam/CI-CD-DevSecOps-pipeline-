FROM node:20-alpine

WORKDIR /app/customer

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8001

CMD ["node", "--require", "./instrumentation.js", "src/index.js"]