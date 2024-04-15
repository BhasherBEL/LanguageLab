# Build stage
FROM node:21-alpine AS build

# Build as non-root user
RUN apk update && apk upgrade && adduser -D svelteuser
USER svelteuser

WORKDIR /app

COPY --chown=svelteuser:svelteuser package.json .
COPY --chown=svelteuser:svelteuser package-lock.json .
RUN npm install

COPY --chown=svelteuser:svelteuser . .
RUN npm run build

# Production stage
FROM node:21-alpine

# Install dumb-init to handle signals properly and run as non-root user
RUN apk update && apk upgrade && apk add dumb-init && adduser -D svelteuser
USER svelteuser

WORKDIR /app

COPY --chown=svelteuser:svelteuser --from=build /app/build /app/package.json /app/package-lock.json ./

EXPOSE 8080

ENV HOST=0.0.0.0 PORT=8080 NODE_ENV=production

CMD ["dumb-init", "node", "index.js"]
