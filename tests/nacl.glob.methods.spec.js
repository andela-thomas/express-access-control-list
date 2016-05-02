(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../');
  var httpMocks = require('node-mocks-http');

  describe('Acl middleware for express', function() {
    var req, res, next;

    /**
     * user policy.
     *
     {
      "group": "user",
      "permissions": [{
        "resource": "user",
        "methods": "*",
        "action": "deny"
      }]
     }
     */
    describe('Policy based on action: "deny and methods glob "*"', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'methods-glob-deny.json',
          path: './tests/config'
        });
        done();
      });

      it('should deny POST operation on /api/mangoes/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        next = function() {
          res.send({
            status: 200,
            success: true,
            message: 'ACCESS GRANTED'
          });
        };


        acl.authorize(req, res, next);

        /**
         * Traffic should be deny
         * methods: ["POST","GET","PUT"]
         * action: "deny"
         */

        var data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });


      it('should deny PUT operation on /api/mangoes/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.session.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be denied
         * methods: ["POST","GET","PUT"]
         * action: "deny"
         */

        var data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });

      it('should deny DElETE operation on /api/mangoes/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * {The policy denies traffic on the below
         *  methods, but allow traffic to other methods not specified}
         * methods: ["POST","GET","PUT"]
         * action: "deny"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });
    });


    /**
     * user policy.
     *
     {
      "group": "user",
      "permissions": [{
        "resource": "*",
        "methods": [
        "POST",
        "GET",
        "PUT"
      ],
      "action": "allow"
      }]
     }
     */
    describe('Policy based on action: "deny and resource glob "*"', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'methods-glob-allow.json',
          path: './tests/config'
        });
        done();
      });

      it('should deny POST operation on /api/mangoes/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        next = function() {
          res.send({
            status: 200,
            success: true,
            message: 'ACCESS GRANTED'
          });
        };


        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');
        done();
      });


      it('should deny PUT operation on /api/mangoes/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

      it('should denie DElETE operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * {The policy denies traffic on the below methods,
         *  but allow traffic to other methods not specified}
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });
    });

    describe('When no methods are defined', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'no-method.json',
          path: './tests/config'
        });

        done();
      });

      it('should deny traffic to any route', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/mangoes/42'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * {The policy denies traffic on the below methods,
         *  but allow traffic to other methods not specified}
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });
    });
  });

})();
