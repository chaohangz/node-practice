var https = require('https')
var fs = require('fs')

// 生成一个自签发的证书
var options = {
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./key-cert.pem')
}

https.createServer(options, function (req, res) {
	res.writerHead(200)
	res.end('Hello worldn')
}).listen(3000)