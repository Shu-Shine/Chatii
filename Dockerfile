FROM node:18-alpine

# set working directory
WORKDIR /chat

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /chat/node_modules/.bin:$PATH

# install and cache dependencies
COPY package*.json .
RUN npm install

COPY . .
EXPOSE 3000

# start app
CMD ["npm", "start"]