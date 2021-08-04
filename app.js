"use strict";

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3667;
const localIpV4Address = require("local-ipv4-address");
const colors = require('colors');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/js', (req, res) => {
    res.sendFile(__dirname + '/public/action.js');
});

app.get('/css', (req, res) => {
    res.sendFile(__dirname + '/public/style.css');
});

let users = [];

io.on('connection', (socket) => {

    socket.on('chat message', (msg) => {
        io.emit('chat message', idName(socket.id) + ": " + msg);
    });

    socket.on('panic', (msg) => {
        io.emit('panic', true);
        io.emit('chat message', sys('Looks like someone set off the 🚨 PANIC 🚨 button!!!!!'));
        socket.emit('chat message', sys('Tell us what happened ' + idName(socket.id) + "?"));
        report({
            event: "Panic",
            info: idName(socket.id) + " (" + socket.id + ")"
        });
    });

    socket.on('register', (msg) => {
        let tempUser = {name:msg, id:socket.id};
        users.push(tempUser);
        io.emit('chat message', sys('NEW USER... ' + msg));
        io.emit('update', updateData());
        socket.emit('chat message', sys('Please take note of the PANIC button ' + idName(socket.id)));
        report({
            event: "register",
            info: idName(socket.id) + " (" + socket.id + ")"
        });
    });

    socket.on('disconnect', (msg) => {
        io.emit('chat message', sys('USER LEFT... ' + idName(socket.id)));
        let disconnectedUser = idName(socket.id);
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == socket.id){
                users.splice(i, 1);
                break;
            }
        }

        io.emit('update', updateData());
        
        report({
            event: "disconnect",
            info: disconnectedUser + " (" + socket.id + ")"
        });
    });
});

function report(event){
    console.log("\n---------------------------------");
    console.log("Online Users (" + users.length + "): ");
    console.log(users);
    console.log(event.event + " - " + event.info);
    console.log("---------------------------------");
    
}

function idName(userId){
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == userId){
            return users[i].name;
        }
    }
}

function updateData(){
    let onlineUsers = users.length;
    let userNames = "";
    for (let i = 0; i < users.length; i++) {
        if (i == users.length - 1){
            userNames += users[i].name + ".";
        } else {
            userNames += users[i].name + ", ";
        }
    }
    return [onlineUsers, userNames];
}

function sys(txt) {
    return "🤖 : " + txt;
}

http.listen(port, () => {
    localIpV4Address().then(function(ipAddress){
        const addressPort = `${ipAddress}:${port}`;
        console.log('\nlistening on', addressPort.green);
    });
});
