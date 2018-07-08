//170829
//map server for terjanq ZT mod client

var MapServerPort = 9700;

//var fs = require('fs');
var http = require('http');
var express = require('express');
var socketIO = require('socket.io');

var app = express();
app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
var io = socketIO.listen(server);

io.sockets.on('connection', function(socket) {
	
	socket.on('joinRoom', function(data) {
		//console.log('joinRoom ', data)
		socket.room = ""
	});

	socket.on('leaveRoom', function(data) {
		//console.log('leaveRoom ', data)
		socket.leave(socket.room);
	});

	socket.on('playerEntered', function(data) {
		//console.log('playerEntered ', data)
		var room = data.serverIp;
		socket.join(room)
		socket.room = room
		socket.signature = data.identifier;
		socket.broadcast.to(room).emit('playerUpdated', data);
	});

	socket.on('playerUpdated', function(data) {
		//console.log('playerUpdated ', data)
		socket.signature = data.identifier;
		socket.broadcast.to(socket.room).emit('playerUpdated', data);
	});

	socket.on('sendMessage', function(data) {
		//console.log('sendMessage ', data)
		io.sockets.in(socket.room).emit('receiveMessage', data);	
	});
	
	//レーダー
	socket.on('coords', function(data) {
		//console.log('coords ', data)
		var room = socket.room;
		socket.broadcast.to(room).emit('updateCoords', data);
	});

	socket.on('disconnect', function() {
		//trace('disconnect');
	});

});

setInterval(function() {
	if(global.gc) global.gc();
}, 10000);

console.log('listening on *:' + MapServerPort);
server.listen(MapServerPort);

process.stdin.on('data', function(chunk) {
	process.exit();
});