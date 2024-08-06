# Building stage
FROM node:20-alpine as build
# RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN npm run build && npm prune --production

# Production stage
FROM node:20-alpine
RUN apk add --no-cache vips-dev

ARG NODE_ENV=production
ARG USER=node
ARG GROUP=node
ARG APP_HOME=/opt/app

ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules

WORKDIR ${APP_HOME}
COPY --from=build /opt/app ./

ENV PATH /opt/node_modules/.bin:$PATH

# Set up permissions
USER root
RUN chown -R ${USER}:${GROUP} ${APP_HOME} && \
    chmod -R 755 ${APP_HOME} && \
    chmod -R 775 ${APP_HOME}/public

USER ${USER}

EXPOSE 1337
CMD ["npm", "run", "start"]
