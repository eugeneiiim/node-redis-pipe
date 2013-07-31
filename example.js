var async = require('async');
var spawn = require('child_process').spawn;

var redisPipe = spawn('redis-cli', ['--pipe']);

redisPipe.stdout.setEncoding('utf8');

redisPipe.stdout.pipe(process.stdout);
redisPipe.stderr.pipe(process.stderr);

var buf = '';

var start = Date.now();
async.times(1000000, function(n, cb) {
  if (n % 10000 === 0) {
    console.log(n, '@', (n / (Date.now() - start)) * 1000, 'cmds/s');
  }

  var cmd = 'SET';
  var key = 'testo:' + n;
  var value = n + '';

  var out = [
    '*3'
    , '$' + cmd.length
    , cmd
    , '$' + key.length
    , key
    , '$' + value.length
    , value
  ];

  var msg = out.join('\r\n') + '\r\n';

  buf += msg;
  if (buf.length > (1 << 19)) {
    redisPipe.stdin.write(buf);
    buf = '';
  }

  cb();
}, function() {
  redisPipe.stdin.end();
});
