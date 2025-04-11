FROM node:lts-buster

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  npm i pm2 -g && \
  rm -rf /var/lib/apt/lists/*
  
RUN git clone https://github.com/Keithkeizzah/KEITH-MD /root/Alpha_BOt
WORKDIR /root/Alpha_Bot/

COPY package.json .
COPY cleanup-sessions.js .

RUN node cleanup-sessions.js

RUN npm install pm2 -g
RUN npm install --legacy-peer-deps dotenv fs path

COPY . .

RUN node cleanup-sessions.js

EXPOSE 3000

# Use a startup script that runs cleanup before starting the server
CMD ["node", "-e", "require('./cleanup-sessions').cleanupSessions(); require('./server')"]
