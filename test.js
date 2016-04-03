var texts       = require('./texts.js');
var s           = require('./summary.js')(texts[1]);




var summary = s.makeSummary();
console.log(summary);