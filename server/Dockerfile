FROM node:20-alpine AS development

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server/ .

COPY shared/ ../shared/

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server/ .

COPY shared/ ../shared/

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY shared/ ../shared/

EXPOSE 3000

CMD ["node", "dist/index.js"]
