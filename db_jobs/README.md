# DATABASE CRON JOBS

These files should be scheadule to run periodically to maintain the integrity of
the data and preserve resources.

+ `update_contracts_table.sh`: This updates the contracts table by inserting new
data from the day before it runs. It can also run with the flag `-e` to fill the
table with the current month of data;

+ `truncate_contracts_table.sh`: This deletes table data older than 15 days, it
should be executed **every month and a half** to balance the use of space and
preserve only more valuable data.
