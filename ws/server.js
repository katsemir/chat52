const { ChatServer } = require('./server/ChatServer');

const chatServer = new ChatServer({ port: 8080 });

chatServer.init();