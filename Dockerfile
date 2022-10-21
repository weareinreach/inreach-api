# syntax=docker/dockerfile:1

FROM node:16-alpine3.15

ENV NODE_ENV=development

WORKDIR /api

COPY ["./package.json", "./yarn.lock", "./"]


RUN yarn install

COPY . .

EXPOSE 8080

CMD yarn seed-docker-db && yarn dev