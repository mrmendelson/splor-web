var Route = require('route-parser')
var $ = require('jquery')

var modules = [
  require('./global'),
  require('./students'),
  require('./classes/class')
]

var location = window.location.pathname

// run all modules that match this route.
$(function() {
  for (var i in modules) {
    var m = modules[i]
    var r = new Route(m.path)
    if (r.match(location)) {
      m.run()
    }
  }
})
