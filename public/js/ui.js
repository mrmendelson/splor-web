/* Shared UI functions */
var $ = require('jquery')
global.jQuery = $
require('bootstrap')

var isProgressMessage = function(message) {
  return /^(\d+\/\d+|completed|starting)$/.test(message)
}

var getProgressBar = function(message) {
  var total = 100
  var hasProgress = isProgressMessage(message)
  var completed = message === 'completed' ? 100 : 0
  var parts = message.split('/')
  if (parts.length > 1) {
    total = parseFloat(parts[1])
    completed = parseFloat(parts[0])
  }
  var percent = ((completed / total) * 100) + '%'
  var bar = $('<div class="progress-bar">')
    .addClass('progress-bar')
    .attr('role', 'progressbar')
    .attr('aria-valuenow', completed)
    .attr('aria-valuemin', 0)
    .attr('aria-valuemax', total)
    .css({ width: percent })
    .html(message)
  var p = $('<div class="progress">').append(bar)
  return p
}

var showAlert = function(message, isError) {
  var progress = isProgressMessage(message)
  var container = []
  var classes = 'alert-dismissible alert'
  var a = $('[role=alert]')
  if (progress) {
    classes += ' progress-alert'
    container = $('#main').find('.progress-alert .alert-content')
    message = getProgressBar(message)
  }
  if (!container.length) {
    a = $('<div role="alert">')
      .addClass(classes)
      .addClass(isError ? 'alert-danger': 'alert-success')
      .append('<button type="button" class="close" data-dismiss="alert">&times;</button>')
      .append('<div class="alert-content">')
    $('#main').prepend(a)
    a.alert()
    container = a.find('.alert-content')
  }
  container.html(message)
  return a
}

function endpointRefresh(endpoint, done) {
  var alertMsg = function(data, isError) {
    var a = showAlert(data.message, isError)
    done(data, a)
  }
  $.ajax({
    method: 'post',
    url: endpoint,
    success: function(data) {
      if (data.jobId) {
        // if we got a jobId back, start polling the job endpoint for status.
        endpointRefresh(endpoint + '/' + data.jobId, done)
      } else if (data.status) {
        // if we get a status message, update our alert progress
        showAlert(data.status)
        if (data.status === 'completed') {
          // if we're done, show a final alert with the message.
          alertMsg(data)
        } else {
          // otherwise, poll again in 1 second.
          setTimeout(function() {
            endpointRefresh(endpoint, done)
          }, 1000)
        }
      } else {
        alertMsg(data)
      }
    },
    error: function(xhr, status, message) {
      var m = xhr && xhr.responseJSON && xhr.responseJSON.error
      alertMsg(m || message, true)
    }
  })
}

module.exports.refreshEvent = function refreshEvent(endpoint, confirmMsg, done) {
  if (!done) {
    done = confirmMsg
    confirmMsg = null
  }
  return function(e) {
    e.preventDefault()
    var confirmed = true
    if (confirmMsg) confirmed = confirm(confirmMsg)
    if (confirmed) {
      // update UI to show loading
      var spinner = $(e.currentTarget).find('.spinner')
      spinner.addClass('spin')
      endpointRefresh(endpoint, function(data, a) {
        spinner.removeClass('spin')
        done(data, a)
      })
    }
  }
}
