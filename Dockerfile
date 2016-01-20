FROM node:wheezy

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD package.json package.json
RUN npm install

ADD . .

# copy the env example if we don't have a .env file
RUN if [ ! -e .env ]; then cp env.example .env; fi

# install the sequelize command line tools globally
RUN npm install -g sequelize-cli

EXPOSE 4000

CMD npm start
