const config = require('config')
const fs = require('fs')
const zlib = require('zlib')
const tls = require('tls')
const https = require('https')
const HttpProxy = require('http-proxy')
const MBTiles = require('@mapbox/mbtiles')
const proxy = new HttpProxy({ changeOrigin: true })

const context = tls.createSecureContext({
  key: fs.readFileSync(config.get('key')),
  cert: fs.readFileSync(config.get('cert')),
  ca: fs.readFileSync(config.get('ca'))
})
const style = fs.readFileSync(config.get('style'))
let mbtiles
new MBTiles(`${config.get('mbtiles')}?mode=ro`, (err, mbt) => {
  if (err) throw err
  mbtiles = mbt
}) 

proxy.on('proxyRes', (proxyRes, req, res) => {
  let body = []
  console.log(req.url)
  proxyRes.on('data', data => {
    body.push(data)
  })
  proxyRes.on('end', async () => {
    body = Buffer.concat(body)
    let match
    if (req.url.endsWith('/resources/styles/root.json')) {
      // modify root.json
      let json = JSON.parse(zlib.gunzipSync(body))
      body = zlib.gzipSync(JSON.stringify(json))
      body = zlib.gzipSync(style)
    } else if (match = req.url.match(/(\d+)\/(\d+)\/(\d+)\.pbf$/)) {
      // modify tiles where available
      let tile = await new Promise((resolve, reject) => {
        mbtiles.getTile(match[1], match[3], match[2], (err, data, headers) => {
          if (err) {
            resolve(false)
          } else {
            resolve(data)
          }
        })
      })
      if(tile) body = tile
    }
    res.writeHead(proxyRes.statusCode, {
      'content-type': proxyRes.headers['content-type'] || 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'content-encoding': proxyRes.headers['content-encoding'] || 'identity',
      'access-control-allow-origin': '*'
    })
    res.write(body)
    res.end()
  })
})

async function main() {
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
}

main()
