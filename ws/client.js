const {WebSocket} = require('ws');

const wsClientFactory = (id) => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('error', console.error);
    
    ws.on('open', function open() {
        console.log(`connected ${id}`);
        
        ws.send(`${id} HELLO`);
    });
    
    ws.on('message', function message(data) {
      console.log(`${id} received: %s`, data);
    });
}

const wsClient1 = wsClientFactory(1);
const wsClient2 = wsClientFactory(2);
const wsClient3 = wsClientFactory(3);


const crypto = require('crypto');
const readline = require('readline');
const net = require('net');


const args = require('minimist')(process.argv.slice(2));
const name = args.name || "User";
const sessionId = args.sessionId || "default-session";
const key = args.key;

if (!key) {
    console.error("Error: Encryption key is required. Pass it using --key argument.");
    process.exit(1);
}

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

function encryptMessage(message) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}
function decryptMessage(encryptedMessage) {
    const [ivHex, encrypted] = encryptedMessage.split(':');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'utf8'), Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const client = net.createConnection({ port: 3000 }, () => {
    console.log(`Connected to chat server as ${name}`);
    client.write(JSON.stringify({ name, sessionId }) + '\n');
});

client.on('data', (data) => {
    try {
        const decryptedMessage = decryptMessage(data.toString());
        console.log(`Server: ${decryptedMessage}`);
    } catch (err) {
        console.error("Failed to decrypt message", err);
    }
});

client.on('end', () => {
    console.log('Disconnected from server');
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const encryptedMessage = encryptMessage(input);
    client.write(encryptedMessage + '\n');
});