'use strict';

var url = require('url'),
  extend = require('util-extend'),
  request = require('request'),
  logger = require('./logger'),
  API_MAX_RESULTS = 5000,
  TIMEOUT_VALUE = 10000;

var delicious = function(username, password) {
  
  var defaults = {
      protocol: 'https',
      host: 'api.del.icio.us',
      auth: username+':'+password
    };

  function getAll(callback) {
    var options = extend(defaults, { 
      pathname : '/v1/posts/all',
      query: { 'results': API_MAX_RESULTS }
    });
    
    request({
      uri: url.format(options),
      method: 'GET',
      timeout: TIMEOUT_VALUE
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
  
  function getPost(href, callback) {
    var options = extend(defaults, { 
      pathname: '/v1/posts/get',
      query: { 'url': encodeURI(href) }
    });
    request({
      uri: url.format(options),
      method: 'GET',
      timeout: TIMEOUT_VALUE
    }, function(err, res, body) {
      if (err) {
        logger.error('%s getting - %s', err.code, href);
        return;
      }
      callback(href, body); 
    });
  };
  
  function removePost(href, callback) {
    var options = extend(defaults, { 
      pathname: '/v1/posts/delete',
      query: { 'url': encodeURI(href) }
    });
    request({
      uri: url.format(options),
      method: 'POST',
      timeout: TIMEOUT_VALUE
    }, function(err, res, body) {
      if (err) {
        logger.error('%s deleting - %s', err.code, href);
        return;
      }
      callback(href, body); 
    });
  };

  return {
    get : getPost,
    all : getAll,
    remove : removePost
  };

};

module.exports = delicious;
