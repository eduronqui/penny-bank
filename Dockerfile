FROM --platform=linux/amd64 node:20-alpine as base

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install

COPY src src

RUN npm run build

FROM base as api

RUN apk update && apk add --no-cache bash curl

WORKDIR /app

RUN curl -O https://raw.githubusercontent.com/eficode/wait-for/v2.1.0/wait-for && chmod +x wait-for

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/dist ./dist

RUN npm install

CMD [ "npm", "run", "serve" ]
