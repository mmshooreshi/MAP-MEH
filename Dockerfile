FROM node:18.4-alpine

RUN mkdir -p /var/www/dockerize-nuxt/nuxt-app
WORKDIR /var/www/dockerize-nuxt/nuxt-app

COPY package*.json ./
RUN npm install

RUN npm install dotenv

COPY . .

RUN npm run build

EXPOSE 3010

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3010

CMD [ "node", ".output/server/index.mjs" ]