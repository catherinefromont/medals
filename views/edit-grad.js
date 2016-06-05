//makes hyperscript work on the server.
require('html-element')
var h = require('hyperscript')
var marked = require('marked')
var o = require('observable')

function toArray (a) {
  if(Array.isArray(a)) return a
  if('object' == typeof a)
    return Object.keys(a).map(function (k) { return a[k] })
  if(!a) return []
  return [a]
}

var Field = require('../widgets/field')
var List = require('../widgets/list')
var Upload = require('../widgets/upload')

module.exports = function (object, cb) {
  //lazy...
  object = object || {}
  var _obj = JSON.parse(JSON.stringify(object ))

  object = object || {}
  object.links = toArray(object.links || [])

  var img = h('img', {src: object.image})
  var cv = h('a', {href: object.cv}, 'download cv')

  return h('div.edit',
    Field('name', object),
    Field('email', object),

    h('div.image',
      img,
      Upload('/blobs/add', function (err, hash, name) {
        console.log('upload', hash, name)
        object.image = img.src = '/blobs/get/'+hash+'?filename='+name
        console.log("UPDATED", object)
      })
    ),

    h('div.bio',
      Field('bio', object, 'textarea')
    ),
    
    h('div.links', h('h3', 'Links'), List(object.links)),

    h('div',
      cv,
      Upload('/blobs/add', function (err, hash, name) {
        object.cv = cv.href = '/blobs/get/'+hash+'?filename='+name
      })
    ),

    h('div',
      h('button', {onclick: function () {
        cb(null, object)
      }}, 'Save'),
      h('button', {onclick: function () {
        cb()
      }}, 'Cancel')
    )
  )

}

