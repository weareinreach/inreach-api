#!/bin/bash

#NOTES: RUN THIS FROM ROOT with command:
# ./migrations/runMigrations.sh
# or migrations folder with command:
# ./runMigrations.sh
# Any other directories will cause the script to fail.

#Use the correct date pattern all the files with a release
#The pattern should follow yyyy.mm.dd{.|_}
export DATE_PATTERN=2021.02.01_

#Check if which directory script was run from
if [[ $PWD == *catalog-api ]]; then
    export CUT=14
elif [[ $PWD == *migrations ]]; then
    export CUT=3
else
    echo "Please run the script from the root of the project catalog-api, or migrations folder. It was run from folder $PWD"
    exit 1
fi

#Retrieve all files and run migration
export  FILES=$(find . -type f -iname "*$DATE_PATTERN*" | cut -c $CUT-)
for i in ${FILES//,/ }; do
    export MIGRATION_FILE=$i

    #Uncomment the one you want to run
    #yarn run-migration
    #yarn rollback-migration
 done