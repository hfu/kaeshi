const config = require('config')
const fs = require('fs')
const tls = require('tls')
const https = require('https')
const HttpProxy = require('http-proxy')
const proxy = new HttpProxy({ changeOrigin: true })
const modifyResponse = require('node-http-proxy-json')

const context = tls.createSecureContext({
  key: fs.readFileSync(config.get('key')),
  cert: fs.readFileSync(config.get('cert')),
  ca: fs.readFileSync(config.get('ca'))
})

proxy.on('proxyRes', (proxyRes, req, res) => {
  if (req.url.endsWith('pbf') || req.url.endsWith('ico')) return
  console.log(req.url)
  console.log(proxyRes.headers)
  modifyResponse(res, proxyRes, (body) => {
console.log('BODYBODYBODY')
    if (body) {
console.log('*')
      console.log(body)
      body.age = 1
    }
    console.log(body)
    console.log('---')
    return body
  })
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
    proxy.web(req, res, {
      target: config.get('target')
    })
  }
).listen(config.get('port'))
