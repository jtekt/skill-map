# Build Stage 1

FROM node:24 AS build
WORKDIR /app

# Copy package.json and your lockfile, 
COPY package.json package-lock.json ./

# 1. Install dependencies, explicitly including the sharp linux-x64 binary
RUN npm install --include=optional --os=linux --cpu=x64 sharp
RUN npm i

# Copy the entire project
COPY . ./

# Build the project
RUN npm run build

# Build Stage 2

FROM node:24-slim
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

ENV NODE_OPTIONS="--max-old-space-size=180"
# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", ".output/server/index.mjs"]

