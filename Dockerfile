FROM node:lts

USER node:node

WORKDIR /home/node/app/
COPY --chown=node:node . .

RUN npm install && npm run build

ENV PORT=80
ENV XFF_DEPTH 1
ENV ADDRESS_HEADER=x-forwarded-for
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host

ENTRYPOINT npm run db:migrate && npm ci --omit dev && node --env-file .env build
EXPOSE 80
