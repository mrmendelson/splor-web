var ui = require('../ui')
var $ = require('jquery')

module.exports.path = '/classes/:id'
module.exports.run = function() {
  $('.refresh-pairings').on('click', function(e) {
    var id = $(e.target).attr('data-id')
    ui.refreshEvent('/api/pairings/refresh/' + id).apply(this, arguments)
  })
}
