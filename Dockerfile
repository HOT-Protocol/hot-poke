FROM node

RUN npm install -g typescript \
    && npm install -g ts-node

COPY src /poke/src
COPY app.ts /poke/app.ts
COPY tsconfig.json /poke/tsconfig.json
COPY package.json /poke/package.json

RUN cd /poke && npm install

WORKDIR /poke