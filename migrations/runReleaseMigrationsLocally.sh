#!/bin/bash

#NOTES: RUN THIS FROM ROOT with command:
# ./migrations/runReleaseMigrationsLocally.sh
# or migrations folder with command:
# ./runReleaseMigrationsLocally.sh
# Any other directories will cause the script to fail.

#Use the correct date pattern all the files with a release
#The pattern should follow yyyy.mm.dd{.|_}
export DATE_PATTERN=2002.10.02

#Check if which directory script was run from
if [[ $PWD == *inrech-api ]]; then
    export CUT=14
elif [[ $PWD == *migrations ]]; then
    export CUT=3
else
    echo "Please run the script from the root of the project inreqch-api, or migrations folder. It was run from folder $PWD"
    exit 1
fi

#Retrieve all files and run migration
export  FILES=$(find . -type f -iname "*$DATE_PATTERN*" | cut -c $CUT-)
for i in ${FILES//,/ }; do
    echo "Exporting file $i..."
    export MIGRATION_FILE=$i
    echo "Running Command..."
    #Uncomment the one you want to run
    #yarn run-migration
    yarn rollback-migration
 done