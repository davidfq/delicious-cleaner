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
  logger = require('winston'),
  version = require('../package').version,
  NOT_FOUND = 404,
  TIMEOUT_VALUE = 10000,
  THROTTLING_VALUE = 2000,
  UA = 'delicious-cleaner Node.js tool '+version;

var cleaner = function(username, password) {

  var api = delicious(username, password),
    removedItems = 0;

  logger.add(logger.transports.File, { 
    filename: __dirname + '/../log/'+new Date().getTime()+'.log' });
  
  api.posts(function(posts){
    parser.parsePostsResponse(posts, checkUrl);
  });

  var checkUrl = function(href, callback){
    logger.profile(href);
    request({
      uri: href,
      method: 'GET',
      timeout: TIMEOUT_VALUE,
      headers: { 'User-Agent': UA }
    }, function(err, res, body) {
      logger.profile(href);
      if (err) {
        logger.error('%s >> %s',  err.code, href);
      } else if (res.statusCode === NOT_FOUND) {
        ++removedItems;
        // https://github.com/avos/delicious-api#keep-in-mind
        // wait two seconds for each query to delicious API, 
        // it avoids being throttled
        setTimeout(function(){
          api.remove(href, parser.parseDeletePostResponse);
        }, removedItems*THROTTLING_VALUE);
      }
      // async flow control iterator callback
      // https://github.com/caolan/async#eachlimitarr-limit-iterator-callback
      callback(null);
    });
  };
};

module.exports = cleaner;
