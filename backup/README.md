# Backup and Restore

The purpose of this is to alleviate the struggle with the migration accuracy. It becomes hard to test out migrations when the data is not the same as the target DB(production).

## Process

This will pull the data from production database, using the [Tools](https://www.npmjs.com/package/node-mongotools). Once the data is backed up it will then restore it to a target Database. The feature also allows users to backup and restore the staging database into their local database(either Docker or MongoDB).

Required env variables(Staging to Local):

`DB_URI_LOCAL={local connection URI}`

`DB_URI_STAGING={staging connection URI}`

Also the `const LOCAL_DB_NAME` needs to be populated with the name of the database in your local configuration.

To run the process:
`yarn backup:staging-local`

## Admin Developers

For developers with elevated permissions to the platform, when you have the Production DB connection string you can run:

`yarn backup:prod-staging` to refresh the staging DB data.

Reminder that the additional env variable, `DB_URI_PRODUCTION` is required to be set on the .env file.
