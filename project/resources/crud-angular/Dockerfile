FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm install -g @angular/cli@19
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
