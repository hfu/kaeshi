# kaeshi
A simplest possible ArcGIS Web Service Server as a reverse proxy

## Background
I wanted to see my vector tiles hosted by tile-block and with style.json to be consumed as an ArcGIS Server Web Service.

## Install
```console
$ git clone git@github.com:hfu/kaeshi
$ cd kaeshi
$ npm install
```

## Config
```console
$ cat config/default.hjson
{
  target: http://arcgis.server.example.com
  secure: false
  key: privkey.pem
  cert: fullchain.pem
  ca: chain.pem
  port: 8808
  style: root-mondo.json 
  mbtiles: ../tile-block/mbtiles/mondo.mbtiles
}
```

## Usage
```console
$ node index.js
```
