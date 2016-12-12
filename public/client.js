
var socket = io();

var player = {};
var players = [];
var game;
var cursor;

  game = new Phaser.Game(800, 600, Phaser.AUTO, 'viewport', { preload: preload, create: create, update: update, render: render });
 
socket.on('connection-opened', function(data){
    
    players = data.currentPlayers;
    setPlayer(data.newPlayer.id)
    //syncState(data.currentPlayers);
    //setPlayer(data.newPlayer.id);

});

socket.on('data-sync', function(data){
        syncState(data);
   });

function setPlayer(id){
    player = get(players,id);
}

function createChar(id,x,y){

    var sprite = game.add.sprite(x,y, 'hero');
    sprite.anchor.set(0.5);

    var down = sprite.animations.add('down',[0]);
    var up = sprite.animations.add('up',[4]);
    var left = sprite.animations.add('left',[6]);
    var right = sprite.animations.add('right',[2]);
    sprite.animations.play('down', 8, true);

    var label = game.add.text(x,y,"player_"+ id, { font: "12px Arial", fill: "#fff" });
    label.anchor.set(0.5);

    return { 
        id : id , 
        pos :{x:x,y:y}, 
        sprite : sprite, 
        label : label };
    
}

function preload() {
    game.load.spritesheet('hero', 'assets/sprites/hero.png',60,90,8);
}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.resize(800, 600);
  
    game.stage.disableVisibilityChange = true;

    cursors = game.input.keyboard.createCursorKeys();

    var s = players;
    players = [];
    s.forEach(function (p,i){
       players.push(createChar(p.id,p.pos.x,p.pos.y));
    });

    setPlayer(player.id);

    game.physics.arcade.enable(player.sprite);
}

function update () {

    if (game.physics.arcade.distanceToPointer(player.sprite, game.input.activePointer) > 8)
    {
        if (cursors.left.isDown)
        {
            player.pos.x -= 2;
            player.dir = 'left';
        }
        else if (cursors.right.isDown)
        {
            player.pos.x += 2;
            player.dir = 'right';
        }

        if (cursors.up.isDown)
        {
            player.pos.y -= 2;
            player.dir = 'up';
        }
        else if (cursors.down.isDown)
        {
            player.pos.y += 2;
            player.dir = 'down';
        }

        player.sprite.animations.play(player.dir, 8, true);
        player.sprite.x = player.pos.x;
        player.sprite.y = player.pos.y;

    }
    else
    {
        player.sprite.body.velocity.set(0);
    }
   
   
   socket.emit('sync-client-input', clean(player));
    updatePositions();
}

function render () {
	//game.debug.spriteInfo(player.sprite,32, 32);
}

function updatePositions(){
   
    for(var i =0; i<players.length; i++){
        players[i].sprite.x = players[i].pos.x;
        players[i].sprite.y = players[i].pos.y; 
        players[i].label.x = players[i].pos.x;
        players[i].label.y = players[i].pos.y - players[i].sprite.height /2 - 10;
        players[i].sprite.animations.play(players[i].dir, 8, true);
    }
}


function syncState(state){
    players.forEach(function(p,i){
        if(exist(state,p.id) == false){
            p.sprite.destroy();
            p.label.destroy();
            remove(p.id);
        }
    });
    state.forEach(function (p,i){
        if(exist(players,p.id) == false ){
            players.push(createChar(p.id,p.pos.x,p.pos.y));
        }else{
            var o = get(players,p.id);
            o.pos = p.pos;
            o.dir = p.dir;
        }
    });

   
}

function remove(id){
      players = players.filter(function(s){ return s.id != id });
}

function exist(list, id){
    return list.filter(function (s){ return s.id === id }).length != 0;
}

function get(list,id){
     return list.filter(function (s){ return s.id === id })[0];
}

function clean(p){
    return {id : p.id, pos : p.pos, dir: p.dir};
}


// socket.on('some-player-connected', function(data){
    
//     var p = createChar(data.id,data.pos.x,data.pos.y);
//     players.push(p);

// });

// socket.on('some-player-disconnected', function(id){
//     var p = players.filter(function(s){ return s.id == id })[0];

//     p.sprite.destroy();
//     p.label.destroy();
//     players = players.filter(function(s){ return s.id != id });

// });

// socket.on('someone-has-moved', function(data){
//     for(var i=0; i<players.length; i++){
//         if(players[i].id == data.id){
//             players[i].pos = data.pos;
//             players[i].sprite.x =  data.pos.x;
//             players[i].sprite.y =  data.pos.y; 
//             players[i].label.x =  data.pos.x;
//             players[i].label.y =  data.pos.y - players[i].sprite.height /2 - 10;
//         }
//     }
// });