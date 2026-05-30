FROM node:lts

RUN apt update && apt install jq postgresql-client -y

USER node:node

WORKDIR /home/node/app/
COPY --chown=node:node . .

RUN npm install && npm run build

ENV PORT=80
ENV XFF_DEPTH=1
ENV ADDRESS_HEADER=x-forwarded-for
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
ENV PGPASSFILE=/home/node/app/.pgpass

ENV ENV_DB_HOSTNAME=***
ENV ENV_DB_USERNAME=***
ENV ENV_DB_NAME=***

ENTRYPOINT ["bash", "./entrypoint.sh"]
EXPOSE 80
