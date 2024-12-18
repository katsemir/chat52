const {randomUUID} = require("crypto");

class Client {
    constructor(options) {
        this.ws = options.ws;
        this.username = options.username;
        this.sessionId = options.sessionId || randomUUID();
        
        this.sendOptions();
    }

    sendOptions() {
        this.send({
            type: 'options',
            sessionId: this.sessionId,
            data: {
                username: this.username
            }
        });
    }

    updateWS(ws) {
        this.ws.terminate();

        this.ws = ws;
    }

    send(msgObject) {
        this.ws.send(JSON.stringify(msgObject));
    }
}

module.exports = { Client };