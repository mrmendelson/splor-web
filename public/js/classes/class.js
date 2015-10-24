var ui = require('../ui')
var $ = require('jquery')

module.exports.path = '/classes/:id'
module.exports.run = function() {
  $('#main').on('click', '.refresh-pairings', function(e) {
    var id = $(e.target).attr('data-id')
    ui.refreshEvent('/api/pairings/refresh/' + id + '?renderPartial=true', function(data, a) {
      if (data.partial) {
        $('.pairings').replaceWith(data.partial)
      }
      setTimeout(function() {
        a.fadeOut()
      }, 2000)
    }).apply(this, arguments)
  })
}
