
'use strict';

var winston = require('winston');

var logger = function(){

  var logger = new (winston.Logger)({
     levels: {
       debug: 1,
       info: 2,
       warn: 3,
       error: 4
     },
     colors: {
       debug: 'blue',
       info: 'green',
       warn: 'yellow',
       error: 'red'
     }
   });

   logger.add(winston.transports.Console, {
     level: 'info',
     prettyPrint: true,
     colorize: true,
     silent: false,
     timestamp: false
   });

   logger.add(winston.transports.File, {
     level: 'debug',
     filename: __dirname + '/../log/'+new Date().getTime()+'.log',
     timestamp: false,
     logFormat: function(level, message) {
       return level+': '+message;
     }
   });

   return logger;
};

module.exports = logger();