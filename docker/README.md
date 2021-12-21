# MongoDB Dockerized

## Purpose

This document will illustrate how to get set up with a dockerized instance of MongoDB to run automation tests against.

## Reason

As more and more developers joined the organization, and automation testing using Cypress was added to 3 main projects, we begun running into issues.

Only one data layer being shared 3 automation suits. With similar naming conventions for data in all project and the practice of self-sufficient tests, tests begin colliding when running in circleCI.

## Instructions

### Installing Docker

- Download [Docker](https://www.docker.com/products/docker-desktop) and install it.
- Run Docker and accept Terms and Conditions

### Running Docker

To manually run mongodb in the docker in your terminal(granted you are already at the project directory):

```
cd docker
docker-compose up -d
```

You should see the output like this:

```
Alfredos-MBP-2:docker moreira$ docker-compose up -d
[+] Running 1/1
 ⠿ Container mongodb  Started                                               0.9s
Alfredos-MBP-2:docker moreira$
```

To connect to the database using MongoDB Compass use the connection string listed below.

```
mongodb://user:password@127.0.0.1:27017/asylum-connect?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
```

Add to your local .env file these two new variables:

```
TEST_DB_URI=mongodb://user:password@127.0.0.1:27017/asylum-connect?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
#Comment ENV variable to connect staging
ENV=TEST
```

To bring the docker image down run:

```
yarn docker:compose-down
```

Note that the DB data will be saved in the path below. Clear that to start the DB from scratch.

```
docker/mongo-volume/
```

### Seeding the Database

In order to seed the database you can run the individual scripts that have the seed: prefix.

Note that organizations related data (ie: comments, reviews etc) need at least one organization seeded, in order to work.

You can run:

```
yarn seed-docker-db
```

This will run all the seed prefix, sequentially.
