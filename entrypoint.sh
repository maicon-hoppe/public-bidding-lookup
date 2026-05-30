npm run db:migrate;
./db_jobs/sucateador.sh;
node --env-file .env build;
npm ci --omit dev;
