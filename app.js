//1.モジュールオブジェクトの初期化
var fs = require("fs");
var server = require("http").createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  console.log(req.url);

 //リクエストurlによって出力先を変更する 
  var output;
  if (req.url == "/visualize.html") {
    output = fs.readFileSync("./visualize.html", "utf-8");
  }else if(req.url == "/img/true.png"){
     output = fs.readFileSync("./img/true.png", "binary");
  }else if(req.url == "/img/false.png"){
    output = fs.readFileSync(".img/false.png", "binary");
  }else if(req.url == "/sensor.html"){
    output = fs.readFileSync("./sensor.html", "utf-8");
  }else{
    output = fs.readFileSync("./visualize.html", "utf-8");
  };
  //output先の決定
  res.end(output);
}).listen(process.env.PORT || 8080);

//socketの設定
var io = require("socket.io").listen(server);

var userHash = {};

// イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (id) {
    console.log("will connect");
    userHash[socket.id] = id;
    console.log("connect");
  });


  //sendDataが呼ばれとき
  socket.on("sendData", function (data) {
    //値を取得
    userHash[socket.sensor] = data.sensor;
    io.sockets.emit("receiveData", {sensor: data.sensor, id: data.id});
  });


  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    console.log("disconnect");
    console.log("" + userHash[socket.id]);
    if (userHash[socket.id]) {
      console.log("will delete");
      io.sockets.emit("removeData", {id: userHash[socket.id]});
      delete userHash[socket];
      console.log("deleted");
    }
  });
});
