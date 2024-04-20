FROM node:18-alpine

# set working directory
WORKDIR /chat/server

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /chat/server/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package*.json .
RUN npm install

COPY . .
EXPOSE 5000

# start app
CMD ["npm", "start"]