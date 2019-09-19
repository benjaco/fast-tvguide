FROM node:10

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 && \
chmod 755 /usr/local/bin/dumb-init

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY server/ ./server/
COPY pwa/ ./pwa/

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD [ "node", "--experimental-worker", "server/server.js" ]