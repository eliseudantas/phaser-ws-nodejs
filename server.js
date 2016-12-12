

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var _id = 0;
var players = [];

app.use(express.static('public'));
app.get('/', function(req, res){  res.sendFile(__dirname + '/index.html');});

http.listen(3000,function(){
    console.log('[server online] listening on 3000');
});

io.on('connection', function(socket){
  
    var player = {
        id : _id++, dir : 'down', 
        pos : {
            x : getRandomInt(1,800), 
            y : getRandomInt(1,600)
        }    
    };

    addNewPlayer(player);
  
    socket.emit('connection-opened',{
        newPlayer : player,
        currentPlayers : players 
    });

    socket.on('sync-client-input',function(state){
        updatePlayerState(state);
        sync_data();
    });

    socket.on('disconnect', function(){
        removePlayer(player.id);
        sync_data();
    });

});

function updatePlayerState(state){
    var p = get(state.id);
    if(p != undefined){ 
        p.pos = state.pos;
        p.dir = state.dir;
    }
}

function addNewPlayer(player){
    players.push(player);
    console.log(`[player ${player.id} ] connected `);
    console.log(`[player ${player.id} ] pos = { x : ${player.pos.x} , y : ${player.pos.y} } `);
}

function removePlayer(id){
    players = players.filter((s) => { return s.id != id });
    console.log(`player ${id} : disconnected `);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function sync_data(){
    console.log('--------------------------------');
    console.log(players);
    io.emit('data-sync', players);
}

function setState(s){
   var player = players.filter(function(i){ return i.id == s.id })[0];
   player.pos = s.pos;
}

function exist(id){
    return players.filter(function (s){ return s.id === id }).length != 0;
}

function get(id){
     return players.filter(function (s){ return s.id === id })[0];
}