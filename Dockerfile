# build step (basic node.js linux docker image, set as variable build-env, used to properly build the app, but not used for hosting)
FROM node:12-alpine AS build-env
WORKDIR /work

# set node registry for access to needed packages
RUN npm set registry https://packages.vertx.cloud
# copy package json for npm install
COPY package.json package-lock.json ./
# copy any local modules used for dev/testing purposes
# NOTE: the square-brackets around local_modules allows the build to continue even if 'local_modules' doesn't exist.
COPY [local_modules] ./local_modules
# run install to fetch all deps
RUN npm install

# copy the sources and build with webpack
COPY webpack.config.js tsconfig.json ./
COPY src ./src
RUN npm run build

# Make the runtime image using coddy (does not have node, as it doesnt need it to run the build project)
# Any other simple fileserver image could be used here to serve /work/wwwroot
FROM caddy:alpine
WORKDIR /usr/share/caddy

# Copy the build outputs. We make sure the build artefacts always stomp the static stuff.
COPY --from=build-env /work/wwwroot ./
