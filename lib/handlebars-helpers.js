var moment = require('moment')

module.exports.fromNow = function(object) {
  var date = moment(new Date(object))
  return date.fromNow()
}

module.exports.debug = function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
    return JSON.stringify({
      value: optionalValue
    }, null, 4)
  }
}
