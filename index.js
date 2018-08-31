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
console.log(req.url)
console.log(proxyRes.headers)
console.log('---')
return
  modifyResponse(res, proxyRes, (body) => {
    if (body) {
      body.age = 1
    }
    return body
  })
/*
  let body = []
  proxyRes.on('data', chunk => {
    body.push(chunk)
  })
  proxyRes.on('end', () => {
    body = Buffer.concat(body).toString()
    console.log(req.url)
    // console.log(body.toString())
    // res.end()
  })
*/
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
    proxy.web(req, res, {
      target: config.get('target')//,
      //selfHandleResponse: true
    })
  }
).listen(config.get('port'))
