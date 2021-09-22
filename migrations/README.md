# Migrations

---

This folder will contain all the migrations to the MongoDB. Schema changes that require default values to be set should be addressed with a migration.

release_date format - yyyy.mm.dd

We recommend to follow the file pattern:

- {release*date}/migration*{schema}.js

The file should follow this template:

```
/*******************************************************************
 *  Release 2021-10-01
 *  Issue:  https://app.asana.com/0/1132189118126148/1176142788936875
 *  Description: This schema change will add is_deleted: false to all
 *               organizations services. When an organization service
 *               is soft deleted by a data manager it will not show up
 *              on General Org/Services queries
 * ******************************************************************



/* eslint-disable no-console */
require('babel-register')({
    presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({path:'.env'});
// Import DB Connection
require('../../src/db');

var mongoose = require('../../src/mongoose');

```

Below the code above add the actual migration to the schema. We recommend adding the rollback script as well and keeping it commented.
