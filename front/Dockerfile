FROM node:24 AS base

WORKDIR /app

RUN corepack enable
COPY package*.json ./
RUN pnpm install

FROM base

COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]