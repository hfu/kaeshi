const config = require('config')
const fs = require('fs')
const proxy = require('http-proxy').createServer({
  ssl: {
    key: fs.readFileSync(config.get('key')),
    cert: fs.readFileSync(config.get('cert'))
  },
  target: 'https://basemaps.arcgis.com',
  secure: true
})