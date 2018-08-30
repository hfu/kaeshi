const config = require('config')
const fs = require('fs')
const tls = require('tls')
const https = require('https')
const HttpProxy = require('http-proxy')
// const proxy = new HttpProxy({ changeOrigin: true})

const proxy = new HttpProxy({
  changeOrigin: true//,
  //target: config.get('target')
})

const context = tls.createSecureContext({
  key: fs.readFileSync(config.get('key')),
  cert: fs.readFileSync(config.get('cert')),
  ca: fs.readFileSync(config.get('ca'))
})

https.createServer(
  {
    SNICallback: (domain, cb) => {
      if (cb) {
        cb(null, context)
      } else {
        return context
      }
    },
    key: fs.readFileSync(config.get('key')),
    cert: fs.readFileSync(config.get('cert'))
  },
  (req, res) => {
    console.log(req.url)
    proxy.web(req, res, { target: config.get('target') })
  } 
).listen(config.get('port'))

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
