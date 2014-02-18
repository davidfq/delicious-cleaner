'use strict';

var url = require('url'),
  extend = require('util-extend'),
  request = require('request'),
  logger = require('winston'),
  parser = require('./parser'),
  API_MAX_RESULTS = 5000;

var delicious = function(username, password) {
  
  var defaults = {
      protocol: 'https',
      host: 'api.del.icio.us',
      auth: username+':'+password
    };

  function getPosts(callback) {
    var options = extend(defaults, { 
      pathname : '/v1/posts/all',
      query: { 'results': API_MAX_RESULTS }
    });
    
    request({
      uri: decodeURIComponent(url.format(options)),
      method: 'GET',
      timeout: 10000
    }, function(err, res, body) {
      if (err) {
        logger.error('Unable to get posts for: %s', username);
        return;
      } else {
        logger.info('Got posts for: %s, about to process them', 
          username);
      }
      callback(body);
    });
  };
  
  function removePost(href, callback) {
    var options = extend(defaults, { 
      pathname: '/v1/posts/delete',
      query: { 'url': href }
    });
    request({
      uri: decodeURIComponent(url.format(options)),
      method: 'POST',
      timeout: 10000
    }, function(err, res, body) {
      if (err) {
        logger.error('%s deleting >> %s', err.code, href);
        return;
      }
      callback(href, body); 
    });
  };

  return {
    posts : getPosts,
    remove : removePost
  };

};

module.exports = delicious;
