FROM node:22-alpine AS base
RUN apk update && apk upgrade && apk add dumb-init
WORKDIR /app

FROM base AS build
# Build stage
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM base
COPY --from=build /app/build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules /app/node_modules
EXPOSE 8080
ENV HOST=0.0.0.0 PORT=8080 NODE_ENV=production
CMD ["dumb-init", "node", "index.js"]
