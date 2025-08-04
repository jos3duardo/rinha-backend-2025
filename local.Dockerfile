FROM node:22-alpine

WORKDIR /app
COPY package.json .
COPY . .
RUN yarn install -y \
  && yarn build

EXPOSE 9999
