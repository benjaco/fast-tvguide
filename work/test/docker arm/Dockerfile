FROM node:10


WORKDIR /usr/src/app

RUN npm install express

RUN echo "const express = require('express'); \
          const app = express(); \
          app.get('/', (req, res) => res.send('Hello port 80')); \
          app.listen(80, () => console.log('Example app listening on port 80!')); \
          const app2 = express(); \
          app2.get('/', (req, res) => res.send('Hello port 443')); \
          app2.listen(443, () => console.log('Example app listening on port 443!'));" > app.js

EXPOSE 80 443
ENTRYPOINT node app.js