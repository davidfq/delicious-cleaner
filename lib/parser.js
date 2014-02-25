
'use strict';

var parse = require('xml2js').parseString,
  async = require('async'),
  logger = require('./logger'),
  ITERATORS_LIMIT = 4;

/*
<?xml version="1.0" encoding="UTF-8"?>
<posts tag="" total="" user="johndoe">
  <post description="" 
    extended="" 
    hash="" 
    href="" 
    private="yes" 
    shared="no" 
    tag="foo bar" 
    time="2014-02-08T10:14:09Z"/>
</posts>

<?xml version="1.0" encoding="UTF-8"?>
<result code="done"/>

<?xml version="1.0" encoding="UTF-8"?>
<result code="The url or md5 could not be found."/>
*/
var parser = {
  parsePostsResponse: function(response, callback) {
    parse(response, function(err, data) {
      var posts = null,
        hrefs = [];
      
      if (err) {
        logger.error(err);
        return;
      }
      
      if (data.posts) {      
        posts = data.posts.post;
        for (var i = 0; i < posts.length; i++) {
          hrefs.push(posts[i].$.href);
        }

        async.eachLimit(hrefs, ITERATORS_LIMIT, callback, function(err) {
          logger.info('PROCESSED - %s links', hrefs.length);
        });
      } else {
        logger.error(data.result.$.code);
      }
    });
  },
  parseDeletePostResponse: function(href, response) {
    parse(response, function(err, data) {
      if (err) {
        logger.error(err);
        return;
      }
      var response = data.result.$.code;
      if (response === 'done'){
        logger.info('DELETED - %s', href);
      } else {
        logger.error('%s - DELETING - %s', response, href);
      }
    });
  }
};

module.exports = parser;


