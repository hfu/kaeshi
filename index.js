const config = require('config')
const fs = require('fs')
// const https = require('https')
const httpProxy = require('http-proxy')
// const proxy = new HttpProxy({ changeOrigin: true})

httpProxy.createProxyServer({
  target: config.get('target')
}).listen(config.get('port'))

/*
https.createServer(
  {
    ssl: {
      key: fs.readFileSync(config.get('key')),
      cert: fs.readFileSync(config.get('cert'))
    }
  },
  //target: config.get('target'),
  //secure: config.get('secure')
  (req, res) => {
    proxy.web(req, res, { target: config.get('target') })
  }
).listen(config.get('port'))
*/