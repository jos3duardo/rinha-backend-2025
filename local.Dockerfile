FROM node:22-alpine

WORKDIR /app
COPY package.json .
COPY . .
RUN yarn install -y \
  && yarn build

ENTRYPOINT [ "yarn", "start:dev" ]