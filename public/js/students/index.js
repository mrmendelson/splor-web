var $ = require('jquery')
var util = require('../util')

module.exports.path = '/students'
module.exports.run = function() {
  $('.container').on('click', '.student', function(e) {
    var t = $(e.target)
    var c = t.find('[type=checkbox]')
    // if we're already clicking the checkbox, we don't need to prevent default.
    if (t.is('[type=checkbox]')) return
    c.prop('checked', !c.prop('checked'))
    e.preventDefault()
  })

  $('.container').on('change', '.header-actions select', function(e) {
    var s = $(e.target)
    var newClass = s.val()
    var action = s.is('#bulk_add')
              ? 'add'
              : s.is('#bulk_remove')
              ? 'remove'
              : null
    var studentCheckboxes = $('.container').find('.student [type=checkbox]:checked')
    var students = studentCheckboxes.get().map(function(el) {
      return $(el).val()
    })
    // reset this form
    s.prop('selectedIndex', 0)
    // update the student classes if we have the correct info
    if (newClass && action && students.length) {
      $.ajax({
        method: 'post',
        url: '/students/bulk',
        data: {
          action: action,
          students: students,
          class: newClass
        },
        error: function(xhr, status, message) {
          var m = xhr && xhr.responseJSON && xhr.responseJSON.error
          util.alert(m || message || 'unknown error', true)
          // scroll to the top
          $("html, body").animate({ scrollTop: 0 }, 200)
        },
        success: function(data) {
          // reset checkboxes
          studentCheckboxes.each(function() { $(this).prop('checked', false) })
          // swap our content
          $('.container').find('.students_list').html(data)
        }
      })
    }
  })
}
