FROM node

RUN npm install -g typescript \
    && npm install -g ts-node

COPY src /poke-drip-bot/src
COPY app.ts /poke-drip-bot/app.ts
COPY tsconfig.json /poke-drip-bot/tsconfig.json
COPY package.json /poke-drip-bot/package.json

RUN cd /poke-drip-bot && npm install

WORKDIR /poke-drip-bot
