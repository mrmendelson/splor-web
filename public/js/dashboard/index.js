var ui = require('../ui')
var $ = require('jquery')

module.exports.path = '/'
module.exports.run = function() {
  $('.retrieve-students').on('click', ui.refreshEvent('/api/students/refresh'))
}
