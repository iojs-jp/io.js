if (!process.versions.openssl) {
  console.error('Skipping because node compiled without OpenSSL.');
  process.exit(0);
}

var common = require('../common');
var assert = require('assert');
var tls = require('tls');
var fs = require('fs');

var options = {
  key: [
    fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
    fs.readFileSync(common.fixturesDir + '/keys/ec-key.pem')
  ],
  cert: [
    fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem'),
    fs.readFileSync(common.fixturesDir + '/keys/ec-cert.pem')
  ]
};

var ciphers = [];

var server = tls.createServer(options, function(conn) {
  conn.end('ok');
}).listen(common.PORT, function() {
  var ecdsa = tls.connect(common.PORT, {
    ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384',
    rejectUnauthorized: false
  }, function() {
    var rsa = tls.connect(common.PORT, {
      ciphers: 'ECDHE-RSA-AES256-GCM-SHA384',
      rejectUnauthorized: false
    }, function() {
      ecdsa.destroy();
      rsa.destroy();

      ciphers.push(ecdsa.getCipher());
      ciphers.push(rsa.getCipher());
      server.close();
    });
  });
});

process.on('exit', function() {
  assert.deepEqual(ciphers, [{
    name: 'ECDHE-ECDSA-AES256-GCM-SHA384',
    version: 'TLSv1/SSLv3'
  }, {
    name: 'ECDHE-RSA-AES256-GCM-SHA384',
    version: 'TLSv1/SSLv3'
  }]);
});
