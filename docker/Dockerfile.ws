FROM    node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY    ./package.json  ./package.json
COPY    ./pnpm-lock.yaml    ./pnpm-lock.yaml
COPY    ./packages  ./packages
COPY    ./turbo.json    ./turbo.json
COPY    ./pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN     pnpm install

COPY    ./apps/ws-server  ./apps/ws-server

RUN     pnpm run prisma:generate

EXPOSE 8080

CMD ["pnpm", "run", "start:ws"]