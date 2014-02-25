/*
 * delicious-cleaner
 * https://github.com/davidfq/delicious-cleaner
 *
 * Copyright (c) 2014 David Fernández
 * Licensed under the MIT license.
 */
'use strict';

var delicious = require('./delicious-api'),
  request = require('request'),
  parser = require('./parser'),
  logger = require('./logger'),
  version = require('../package').version,
  NOT_FOUND = 404,
  TIMEOUT_VALUE = 10000,
  THROTTLING_VALUE = 2000,
  UA = 'delicious-cleaner Node.js tool '+version;

var cleaner = function(username, password) {


  var api = delicious(username, password),
    removedItems = 0;

  api.all(function(posts){
    parser.parsePostsResponse(posts, checkUrl);
  });

  var checkUrl = function(href, callback){
    var start = Date.now();
    request({
      uri: href,
      method: 'GET',
      timeout: TIMEOUT_VALUE,
      headers: { 'User-Agent': UA }
    }, function(err, res, body) {
      var duration = Date.now() - start;

      if (err) {
        logger.error('%s - %s',  err.code, href);
      } else if (res.statusCode === NOT_FOUND) {
        logger.info('%s - %s', res.statusCode, href);

        ++removedItems;
        // https://github.com/avos/delicious-api#keep-in-mind
        // wait two seconds for each query to delicious API, 
        // it avoids being throttled
        setTimeout(function(){
          api.remove(href, parser.parseDeletePostResponse);
        }, removedItems*THROTTLING_VALUE);

      } else {
        logger.debug('%s - %s - %dms', res.statusCode, href, duration);
      }
      // async flow control iterator callback
      // https://github.com/caolan/async#eachlimitarr-limit-iterator-callback
      callback(null);
    });
  };
};

module.exports = cleaner;
