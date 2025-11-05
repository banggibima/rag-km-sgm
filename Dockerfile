FROM oven/bun:1

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["bun", "run", "index.ts"]
