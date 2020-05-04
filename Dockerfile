FROM node:12.16.3-alpine3.11

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
