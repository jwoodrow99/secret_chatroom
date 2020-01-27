"use strict";

$(function () {
    const socket = io();

    let name = prompt('What is your name...');
    socket.emit('register', name);

    $('form').submit( () => {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    $('#panic').click(() => {
        socket.emit('panic', true);
    });

    socket.on('chat message', (msg) => {
        $('#messages').append($('<li>').text(msg));
        $('.scroll').scrollTop($('.scroll')[0].scrollHeight);
    });

    socket.on('panic', (msg) => {
        $("#messages").empty();
    });

    socket.on('update', (msg) => {
        $("#num").html("Number of online users: " + msg[0]);
        $("#users").html("All online users: " + msg[1]);
    });
});