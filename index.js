const config = require('config')
const fs = require('fs')
const zlib = require('zlib')
const tls = require('tls')
const https = require('https')
const HttpProxy = require('http-proxy')
const proxy = new HttpProxy({ changeOrigin: true })

const context = tls.createSecureContext({
  key: fs.readFileSync(config.get('key')),
  cert: fs.readFileSync(config.get('cert')),
  ca: fs.readFileSync(config.get('ca'))
})

proxy.on('proxyRes', (proxyRes, req, res) => {
  let body = []
  console.log(req.url)
  proxyRes.on('data', data => {
    body.push(data)
  })
  proxyRes.on('end', () => {
    body = Buffer.concat(body)
    if (req.url.endsWith('VectorTileServer?f=json')) {
      let json = JSON.parse(zlib.gunzipSync(body))

      body = zlib.gzipSync(JSON.stringify(json))
    }
    res.writeHead(proxyRes.statusCode, {
      'content-type': proxyRes.headers['content-type'] || 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'content-encoding': proxyRes.headers['content-encoding'] || 'identity',
      'access-control-allow-origin': '*'
    })
    res.write(body)
    res.end()
    console.log('===')
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
      target: config.get('target'), 
      selfHandleResponse: true
    })
  }
).listen(config.get('port'))
