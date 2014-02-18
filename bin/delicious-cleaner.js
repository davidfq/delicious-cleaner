#!/usr/local/bin/node

var cleaner = require("../lib/cleaner"),
  prompt = require('prompt'),
  logger = require('winston'),
  schema = {
    properties : {
      username : {
        message : 'your delicious.com username',
        required : true
      },
      password : {
        hidden : true
      }
    }
  };

prompt.start();
prompt.get(schema, function (err, result) {
  if (err) {
    logger.error(err);
    return;
  }
  cleaner(result.username, result.password);
});

