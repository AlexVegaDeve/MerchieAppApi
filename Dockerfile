FROM node:14.14.0-alpine
WORKDIR /app
COPY package.json ./app 
RUN npm install
COPY . /app/
CMD ["npm", "start"]