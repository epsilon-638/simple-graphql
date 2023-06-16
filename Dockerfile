FROM node:17-alpine

WORKDIR /app

COPY src /app/src/
COPY package.json .
COPY tsconfig.json .

RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
