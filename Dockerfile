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
RUN npm install --only=production
WORKDIR /usr/src/app/web
RUN npm install --only=production

# Copy the code over
WORKDIR /usr/src/app
COPY ./server ./server/
COPY ./web ./web/

WORKDIR /usr/src/app/web
RUN npm run-script build --only=production

EXPOSE 3000

WORKDIR /usr/src/app/server
CMD [ "npm", "start" ]