# syntax=docker/dockerfile:1

FROM node:16-alpine3.15

ENV NODE_ENV=development

WORKDIR /api

COPY ["./package.json", "./yarn.lock", "./"]


RUN --mount=type=cache,target=/mnt/ramdisk/cache/yarn YARN_CACHE_FOLDER=/mnt/ramdisk/.cache/yarn yarn install

COPY . .

EXPOSE 8080

CMD yarn seed-docker-db && yarn dev