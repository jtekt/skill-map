FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV NITRO_PORT=80
EXPOSE 80
CMD [ "npm", "run", "start" ]