FROM node:14.12.0-alpine

WORKDIR /app

RUN yarn global add react-scripts@3.4.1

COPY . .

RUN yarn install

EXPOSE 8080

CMD ["yarn", "start"]
