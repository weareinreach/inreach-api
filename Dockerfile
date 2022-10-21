# syntax=docker/dockerfile:1

FROM node:16-alpine3.15 as BUILDER

WORKDIR /api

COPY ["./package.json", "./yarn.lock", "./"]
RUN --mount=type=cache,target=~/.cache/yarn YARN_CACHE_FOLDER=~/.cache/yarn yarn install


FROM node:16-alpine3.15

ENV NODE_ENV=development

WORKDIR /api
COPY --from=BUILDER /api/node_modules ./node_modules

COPY . .

RUN apk add --no-cache tini
ENTRYPOINT [ "/sbin/tini", "--" ]

EXPOSE 8080

CMD yarn seed-docker-db && yarn dev