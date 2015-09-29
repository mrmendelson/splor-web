$(function() {
  /**
   * Currently, we're just using basic jquery (since bootstrap wants it anyway)
   * to handle on-page interactions, and using express to handle dynamic elements.
   * We should probably migrate to a framework if on-page interactions become more complex,
   * but at this time it seems like overkill. ~jd
   */

  function endpointRefresh(endpoint, done) {
    var showAlert = function(message, isError) {
      var a = $('<div role="alert">')
        .addClass('alert-dismissible alert')
        .addClass(isError ? 'alert-error': 'alert-success')
        .append('<button type="button" class="close" data-dismiss="alert">&times;</button>')
        .append(message)
      $('#main').prepend(a)
      a.alert()
      done()
      if (!isError) setTimeout(function() { window.location.reload() }, 2000)
    }
    $.ajax({
      method: 'get',
      url: endpoint,
      success: function(data) {
        showAlert(data.message)
      },
      error: function(xhr, status, message) {
        var m = xhr && xhr.responseJSON && xhr.responseJSON.error
        showAlert(m || message, true)
      }
    })
  }

  function refreshEvent(endpoint) {
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

  $('.retrieve-students').on('click', refreshEvent('/api/students/refresh'))
  $('.refresh-pairings').on('click', refreshEvent('/api/pairings/refresh'))

})
