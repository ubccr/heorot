FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Add grendel user for socket bind
RUN groupadd -g 999 grendel
RUN useradd -u 999 -g 999 grendel
RUN usermod -aG grendel node

USER node

CMD ["node", "server.js"]