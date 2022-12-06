FROM node:18

ENV NODE_ENV production
ARG UNAME=grendel
ARG UID=999
ARG GID=999

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY --chown=node:node . .

# Add grendel user for socket bind
RUN groupadd -g $GID $UNAME
RUN useradd -u $UID -g $GID $UNAME
RUN usermod -aG $UNAME node

USER node

CMD ["node", "server.js"]