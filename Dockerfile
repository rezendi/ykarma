FROM node:9

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./server/package*.json ./server/
COPY ./web/package*.json ./web/

# Install the dependencies
WORKDIR /usr/src/app/server
RUN npm install
WORKDIR /usr/src/app/web
RUN npm install

# Copy the code over
WORKDIR /usr/src/app
COPY ./web ./web/

WORKDIR /usr/src/app/web
RUN npm run build

WORKDIR /usr/src/app
COPY ./server ./server/

EXPOSE 3000
EXPOSE 3001

WORKDIR /usr/src/app/server
CMD [ "npm", "start" ]