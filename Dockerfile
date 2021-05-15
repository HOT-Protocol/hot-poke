FROM node

RUN npm install -g typescript \
    && npm install -g ts-node

COPY src /poke-drip/src
COPY app.ts /poke-drip/app.ts
COPY tsconfig.json /poke-drip/tsconfig.json
COPY package.json /poke-drip/package.json

RUN cd /poke-drip && npm install

WORKDIR /poke-drip