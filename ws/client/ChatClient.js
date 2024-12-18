const {WebSocket} = require('ws');

class ChatClient {
    constructor(options) {
        this.ws = new WebSocket(options.url);
        this.sessionId = options.sessionId || null;
        this.username = options.username;
    }

    init() {
        this.ws.on('open', () => this.onOpen());
        this.ws.on('message', (data) => this.onMessage(data));
        this.ws.on('error', console.error);
    }

    onOpen() {
        console.log('connected');
        this.ws.send(JSON.stringify({
            type: 'options',
            sessionId: this.sessionId,
            data: {
                username: this.username
            }
        }));

    }

    onMessage(data) {
        const parsedData = JSON.parse(data);
        

        switch (parsedData.type) {
            case 'message':
                console.log(`${parsedData.data.sender} >>: ${parsedData.data.message}`);
                break;
            case 'options':
                this.setOptions(parsedData);
                break;
            default:
                console.log('unknown message type');
        }
    }

    setOptions(msgObject) {
        this.sessionId = msgObject.sessionId;
        console.log('Your sessionId: ', this.sessionId);
    }

    send(data) {
        const msgObject = {
            type: 'message',
            sessionId: this.sessionId,
            data: data
        };
        this.ws.send(JSON.stringify(msgObject));
    }
}


module.exports = { ChatClient };