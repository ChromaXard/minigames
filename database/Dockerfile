FROM postgres:18

RUN apt-get update && apt-get install -y postgresql-18-cron

COPY ./init-cron.sh /docker-entrypoint-initdb.d/01-init-cron.sh