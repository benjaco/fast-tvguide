# Fast tv guide

Just a fast tv guide

# To get up and running

install npm-run globally "npm install -g npm-run"

install developer dependencies "npm install"

run `npm run build` to build the pwa app


## run server with nodejs
`user_agent='***' domain=*** email=*** secure=1 node --experimental-worker server/server.js`

## with docker
```
mkdir ssl_certs
mkdir data
docker run -e user_agent='***' -e secure='1' -e domain='***' -e email='***' -p 80:80 -p 443:443 -v $PWD/ssl_certs:/usr/src/app/server/ssl_certs -v $PWD/data:/usr/src/app/server/data benjaco/fast-tvguide
```