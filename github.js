var http = require('http');
var spawn = require('child_process').spawn;
var createHandler = require('github-webhook-handler');

var auto_build_scirpt = '.git/hooks/post-update.sh'
// 下面填写的myscrect跟github webhooks配置一样，下一步会说；path是我们访问的路径
var handler = createHandler({ path: '/auto_build', secret: '' });

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  })
}).listen(6666);

handler.on('error', function (err) {
  console.error('Error:', err.message)
});

// 监听到push事件的时候执行我们的自动化脚本
handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);

  runCommand('sh', [auto_build_scirpt], function (txt) {
    console.log(txt);
  });
});

function runCommand(cmd, args, callback) {
  var child = spawn(cmd, args);
  var response = '';
  child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function () { callback(resp) });
}

// 由于我们不需要监听issues，所以下面代码注释掉
//  handler.on('issues', function (event) {
//    console.log('Received an issue event for %s action=%s: #%d %s',
//      event.payload.repository.name,
//      event.payload.action,
//      event.payload.issue.number,
//      event.payload.issue.title)
//});
