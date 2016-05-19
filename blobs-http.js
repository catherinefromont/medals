var pull   = require('pull-stream')
var toPull = require('stream-to-pull-stream')

var qs = require('querystring')
var URL = require('url')
      //host blobs
module.exports = function (blobs, url) {
  return function (req, res, next) {

    next = next || function (err) {
      res.writeHead(404, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({error: true, status: 404}))
    }

    if(req.url === url+'/add')
      pull(
        toPull(req),
        blobs.add(function (err, hash) {
          res.end(hash)
        })
      )
    else if(req.url.indexOf(url+'/get/') == 0) {
      var u = URL.parse('http://makeurlparseright.com'+req.url)
      var hash = u.pathname.substring((url+'/get/').length)
      var q = qs.parse(u.query)

      if(q.filename)
        res.setHeader('Content-Discosition', 'inline; filename='+q.filename)

      blobs.has(hash, function (err, has) {
        if(err) return next(err)

        res.writeHead(200)
        pull(
          blobs.get(hash),
          //since this is an http stream, handle error the http way.
          pull.through(null, function (err) {
            if(err) throw err //DEBUG
            if(err) next(err)
          }),
          toPull(res)
        )
      })
    }
    else next()
  }
}

