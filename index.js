let dgram = require('dgram'); 
let express = require('express');

let app = express();
let sockets = [];

require('express-ws')(app);
app.use(require('body-parser').json());

app.ws('/devices', (ws, req) => {
    sockets.push(ws);
    getSysInfo();

    ws.on('message', e => {
        let data = JSON.parse(e);
        
        if (data.action === 'get-info') {
            getSysInfo();
        }

        if (data.action === 'send-payload') {
            let { ip, payload } = data;
            sendPayload(ip, payload, () => {
                getSysInfo();
            });
        }
    });
    
    ws.on('close', () => {
        sockets.splice(sockets.indexOf(ws), 1);
    });
});

let udp_client = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true
});

udp_client.on('message', (msg, remote) => {
    msg = JSON.parse(transformMessage(msg, 'decrypt').toString('ascii'));

    if (msg.system && msg.system.get_sysinfo) {
        msg = {
            info: msg.system.get_sysinfo,
            ip: remote.address
        };
    }

    sockets.forEach(socket => {
        socket.send(JSON.stringify(msg));
    });
});

udp_client.bind(9998, undefined, () => {
    console.log('Binded to UDP 9998...');

    let port = process.env.TPLINK_PORT || 3005;
    app.listen(port, () => {
        console.log('Listening on TCP ' + port + '...');
    });
});

function getSysInfo () {
    let msg = transformMessage(Buffer.from('{"system":{"get_sysinfo":{}}}'), 'encrypt');
    udp_client.setBroadcast(true);
    udp_client.send(msg, 0, msg.length, 9999, '255.255.255.255'); 
}

function sendPayload (ip, payload, callback) {
    let payload_client = dgram.createSocket('udp4')
    let msg = transformMessage(Buffer.from(JSON.stringify(payload)), 'encrypt');
    payload_client.send(msg, 0, msg.length, 9999, ip, (err, bytes) => {
        if (err) {
            return ws.send(JSON.stringify({ error: 'failed to send payload' }));
        }
        
        payload_client.on('message', msg => {
            callback();
            payload_client.close();
        });
    });
}

function transformMessage (buffer, mode) {
    let key = 0xAB;

    for (let i = 0; i < buffer.length; i++) {
        let c = buffer[i];
        buffer[i] = c ^ key;
        key = mode === 'encrypt'? buffer[i] : c;
    }

    return buffer;
}