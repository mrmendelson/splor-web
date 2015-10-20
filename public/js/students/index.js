var $ = require('jquery')

module.exports.path = '/students'
module.exports.run = function() {
  $('.container').on('click .student', function(e) {
    var c = $(e.target).find('[type=checkbox]')
    c.prop('checked', !c.prop('checked'))
    e.preventDefault()
  })
}
