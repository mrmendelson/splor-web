/* Shared UI functions */
var $ = require('jquery')
global.jQuery = $
require('bootstrap')

var showAlert = function(message, isError) {
  var a = $('<div role="alert">')
    .addClass('alert-dismissible alert')
    .addClass(isError ? 'alert-danger': 'alert-success')
    .append('<button type="button" class="close" data-dismiss="alert">&times;</button>')
    .append(message)
  $('#main').prepend(a)
  a.alert()
  return a
}

function endpointRefresh(endpoint, done) {
  var alertMsg = function(message, isError) {
    showAlert(message, isError)
    done()
    if (!isError) setTimeout(function() { window.location.reload() }, 2000)
  }
  $.ajax({
    method: 'get',
    url: endpoint,
    success: function(data) {
      alertMsg(data.message)
    },
    error: function(xhr, status, message) {
      var m = xhr && xhr.responseJSON && xhr.responseJSON.error
      alertMsg(m || message, true)
    }
  })
}

module.exports.refreshEvent = function refreshEvent(endpoint) {
  return function(e) {
    e.preventDefault()
    // update UI to show loading
    var spinner = $(e.target).find('.spinner')
    spinner.addClass('spin')
    endpointRefresh(endpoint, function() {
      spinner.removeClass('spin')
    })
  }
}
