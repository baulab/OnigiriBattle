var gameServer = module.exports = { games : {}, game_count:0 };

gameServer.onPlayerMoved = function(client, m){
  console.log("\t client: "+client.userid+" action: "+m.msg);
};

gameServer.onDisconnected = function(client, m){
  console.log('\t socket.io:: client disconnected ' + client.userid );
};