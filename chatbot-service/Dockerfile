FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY prisma ./prisma
RUN npx prisma@5.22.0 generate

COPY src ./src

EXPOSE 8000

CMD ["npm", "start"]
