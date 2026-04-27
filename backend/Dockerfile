FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma.config.ts ./prisma.config.ts
COPY prisma ./prisma
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
