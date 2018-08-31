const config = require('config')
const fs = require('fs')
const zlib = require('zlib')
const tls = require('tls')
const https = require('https')
const HttpProxy = require('http-proxy')
const proxy = new HttpProxy({ changeOrigin: true })
//const modifyResponse = require('node-http-proxy-json')

const context = tls.createSecureContext({
  key: fs.readFileSync(config.get('key')),
  cert: fs.readFileSync(config.get('cert')),
  ca: fs.readFileSync(config.get('ca'))
})

proxy.on('XXproxyRes', (proxyRes, req, res) => {
  let body = []
  console.log(req.url)
  console.log(proxyRes.headers)
  proxyRes.on('data', data => {
    body.push(data)
  })
  proxyRes.on('end', () => {
    body = Buffer.concat(body)
    if (proxyRes.headers['content-encoding'] === 'gzip') {
      body = zlib.gunzipSync(body)
    }
    if (!req.url.endsWith('pbf')) console.log(body.toString('utf-8'))



    // NG body = zlib.gzipSync(body)
    res.headers = proxyRes.headers
    res.headers['content-length'] = Buffer.byteLength(body)
    res.end(body)
    console.log(res.headers)
    console.log('===')
  })
/*
  if (req.url.endsWith('pbf') || req.url.endsWith('ico')) return
  const _end = res.end, _writeHead = res.writeHead, _write = res.write
  let chunks
  proxyRes.on('data', chunk => {
    console.log(chunk.toString('utf-8'))
  })
  proxyRes.on('end', () => {
    console.log('end')
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
    proxy.web(req, res, {
      target: config.get('target'), 
      selfHandleResponse: false
    })
  }
).listen(config.get('port'))
