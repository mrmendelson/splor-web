var $ = require('jquery')
global.jQuery = $
require('bootstrap')
var util = {}

util.alert = function(message, isError) {
  var a = $('<div role="alert">')
    .addClass('alert-dismissible alert')
    .addClass(isError ? 'alert-error': 'alert-success')
    .append('<button type="button" class="close" data-dismiss="alert">&times;</button>')
    .append(message)
  $('#main').prepend(a)
  a.alert()
  return a
}

module.exports = util
