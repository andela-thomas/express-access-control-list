# express-acl
[![Build Status](https://travis-ci.org/andela-thomas/express-acl.svg?branch=master)](https://travis-ci.org/andela-thomas/express-acl)
[![Coverage Status](https://coveralls.io/repos/github/andela-thomas/express-acl/badge.svg?branch=develop)](https://coveralls.io/github/andela-thomas/express-acl?branch=develop)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/6cba987b85b84f11bb5ab0340388a556)](https://www.codacy.com/app/thomas-nyambati/express-acl)

Express Access Control Lists (express-acl) enable you to manage the requests made to your express server. It makes use of ACL rules to protect your sever from unouthorized access. ACLs defines which user groups are granted access and the type of access they have against a specified resource. When a request is received against a resource, `express-acl` checks the corresponding ACL policy to verify if the requester has the necessary access permissions.

##### What is ACL rules
ACL is a set of rules that tell `express-acl` how to handle the requests made to your server against a specific resource. Think of them like road signs or traffic lights that control how your traffic flows in your app. ACL rules are defined in JSON format.

**Example**
``` json
[{
  "group": "user",
  "permissions": [{
    "resource": "users",
    "methods": [
      "POST",
      "GET",
      "PUT"
    ]
  }],
  "action": "allow"
}]

```
The contents of this file will be discussed in the usage section


## Installation

You can download `express-acl` from NPM
```
  $ npm install express-acl

```

then in your project require express-acl

``` js

  var acl =  require('express-acl');

```

 or GitHub

 ```
  $ git clone https://github.com/andela-thomas/express-acl.git

  ```
copy the lib folder to your project and then require `nacl.js`

``` js

  var acl =  require('./lib/nacl');

```

# Usage

Express acl uses the configuration approach to define access levels.

1. #### Configuration ` config.json`
  First step is to create a file called `config.json` and place this in the root folder. This is the file where we will define the roles that can access our application, and the policies that restrict or give access to certain resources. Take a look at the example below.

  ```json

  [{
    "group": "admin",
    "permissions": [{
      "resource": "*",
      "methods": "*"
    }],
    "action": "allow"
  }, {
    "group": "user",
    "permissions": [{
      "resource": "users",
      "methods": [
        "POST",
        "GET",
        "PUT"
      ]
    }],
    "action": "deny"
  }]
```

  In the example above we have defined an ACL with two policies with two roles,  `user` and `admin`. A valid ACL should be an Array of objects(policies). The properties of the policies are explained below.

    Property | Type | Description
    --- | --- | ---
    **group** | `string` | This property defines the access group to which a user can belong to  e.g `user`, `guest`, `admin`, `trainer`. This may vary depending with the architecture of you application.
    **permissions** | `Array` | This property contains an array of objects that define the resources exposed to a group and the methods allowed/denied
    **resource** | `string` | This is the resource that we are either giving access to. e.g `blogs` for route `/api/blogs`, `users` for route `/api/users`. You can also specify a glob `*` for all resource/routes in your application(recommended for admin users only)
    **methods** | `string or Array` | This are http methods that a user is allowed or denied from executing. `["POST", "GET", "PUT"]`. use glob `*` if you want to include all http methods.
    **action** | `string` | This property tell express-acl what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic on route `/api/users` for methods `GET, PUT, POST` are denied, but the rest allowed. And for the admin, all traffic for all resource is allowed.

  #### How to write ACL rules
  ACLs define the way requests will be handled by express acl, therefore its important to ensure that they are well designed to maximise efficiency. For more details follow this [link](https://github.com/andela-thomas/express-acl/wiki/How-to-write-effective-ACL-rules)

2. #### Authentication
For express-acl depends on the role of each Authenticated user to pick the corresponding ACL policy for each deifined user groups. Therefore, You should always place the acl middleware after the authenticate middleware. Example using jsonwebtoken middleware

  ``` js
  // jsonwebtoken powered middleware
  ROUTER.use(function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, key, function(err, decoded) {
        if (err) {
          return res.send(err);
        } else {
          req.decoded = decoded;
          next();
        }

      });
    }
  });

  // express-acl middleware depends on the the role
  // the role can either be in req.decoded (jsonwebtoken)or req.session
  // (express-session)

  ROUTER.use(acl.authorize);
  ```
# API
There are two API methods for express-acl.

  **config[type: function, params: path, encoding]**
    This methods loads the configuration json file. When this method it looks for `config.json` the root folder if path is not specified.
    ``` js
    var acl = require('express-acl');

    // path not specified
    // looks for config.json in the root folder
    acl.config();

    // path specified
    // looks for ac.json in the config folder
    acl.config({path:'./config/acl.json'});

    // When specifying path you can also rename the json file e.g
    // The above file can be acl.json or config.json or any_file_name.json
    ```

  **getRules[tyepe:  function, params: none]** _optional_

    This enables you to know the rule being applied on a specific user. use this for development purposes.

    ```js
    // req.decoded.role  = 'user'
    var currentRule = acl.getRules()

    //current rule will have the rules for user role
    ```
  **authorize [type: middleware]**

    This is the middleware that manages your application requests based on the role and acl rules.

    ```js

      app.get(acl.authorize);

    ```

# Example
Install express-acl
```
npm install express-acl
```

Create config.json in your root folder
``` json
[{
  "group": "user",
  "permissions": [{
    "resource": "users",
    "methods": [
      "POST",
      "GET",
      "PUT"
    ]
  }],
  "action": "allow"
}]
```

Require express-acl in your project router file.
```js
  var acl = require('express-acl');
```

Call the config method
```js
  acl.config();
```

Add the acl middleware
```js
  app.get(acl.authorize);
```

For more details check the examples folder.[examples](https://github.com/andela-thomas/express-acl/tree/master/examples)
