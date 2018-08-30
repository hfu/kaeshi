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
  target: https://somewhere.com
  secure: true
  key: somewhere/valid-ssl-key.pem
  cert: somewhere/valid-ssl-cert.pem
  port: 443
}
```
## Usage
```console
$ node index.js
```
