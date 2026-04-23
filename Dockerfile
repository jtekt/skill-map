# Build Stage 1
FROM node:24 AS build
WORKDIR /app

# Copy package.json and your lockfile,
COPY package.json package-lock.json ./

# 1. Install dependencies, explicitly including the sharp linux-x64 binary
# NOTE: Install sharp first to ensure native binary is available on linux-x64
RUN npm install --include=optional --os=linux --cpu=x64 sharp

# Install remaining dependencies
RUN npm i

# Copy the entire project
COPY . ./

# Build the project
RUN npm run build



# Build Stage 2
FROM node:24-slim
WORKDIR /app

# Only `.output` folder is needed from the build stage
# IMPORTANT: KEEP .output FOLDER STRUCTURE INTACT — do not flatten
COPY --from=build /app/.output ./.output
# COPY --from=build /app/migrate.sh ./migrate.sh

ENV NODE_OPTIONS="--max-old-space-size=180"

# Ensure migrate script executable
# RUN chmod +x ./migrate.sh

# Change the port and host
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
EXPOSE 80

CMD ["node", ".output/server/index.mjs"]