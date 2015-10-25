var ui = require('../ui')
var $ = require('jquery')

module.exports.path = '/classes/:id'
module.exports.run = function() {
  $('#main').on('click', '.refresh-pairings', function(e) {
    var id = $(e.currentTarget).attr('data-id')
    ui.refreshEvent('/api/pairings/refresh/' + id + '?renderPartial=true', function(data, a) {
      if (data.partial) {
        $('.pairings').replaceWith(data.partial)
      }
      setTimeout(function() {
        a.fadeOut()
      }, 2000)
    }).apply(this, arguments)
  })

  $('#main').on('click', '.splor-button', function(e) {
    var el = $(e.currentTarget)
    var id = el.attr('data-id')
    var spinner = $('<span class="glyphicon glyphicon-refresh spinner"></span>')
    el.children().first().before(spinner)
    ui.refreshEvent('/api/splor/' + id, function(data, a) {
      spinner.remove()
      setTimeout(function() {
        a.fadeOut()
      }, 2000)
    }).apply(this, arguments)
  })
}
