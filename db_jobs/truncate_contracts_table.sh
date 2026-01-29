#!/bin/bash

DATE_LIMIT=$(date --utc -I -d "-15 days");
psql -h 127.0.0.1 -U svelte_user -d svelte_data -c "DELETE FROM contratos WHERE vigencia_inicial < '$DATE_LIMIT'";
