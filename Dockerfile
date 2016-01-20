FROM node:wheezy

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD package.json package.json
RUN npm install

ADD . .

EXPOSE 4000

CMD npm start
