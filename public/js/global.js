var ui = require('./ui')
var $ = require('jquery')

module.exports.path = '/*path'
module.exports.run = function() {
  // Sticky Scroll
  var sticky = $('.sticky')
  var win = $(window)
  if (sticky.length) {
    var stickyTop = sticky.offset().top
    win.on('scroll', function() {
      var topDiff = win.scrollTop() - stickyTop
      if (topDiff > 0) {
        sticky.addClass('stuck')
        sticky.css({top: topDiff})
      } else {
        sticky.removeClass('stuck')
      }
    })
  }

  // Filtering
  $('.filter').on('keyup', function(e) {
    var val = $(e.target).val()
    var pattern = new RegExp(val, 'i')
    $('[data-filter]').each(function() {
      var filterValue = $(this).attr('data-filter')
      if (pattern.test(filterValue)) {
        $(this).show()
      } else {
        $(this).hide()
      }
    })
  })

  // Refresh students
  $('body').on('click', '.retrieve-students', ui.refreshEvent('/api/students/refresh', 'Refreshing students can take a very long time. Are you sure you want to refresh your students now?', function() {
    // reload the page automatically once we've completed refreshing the students.
    setTimeout(function() { window.location.reload() }, 4000)
  }))
}
