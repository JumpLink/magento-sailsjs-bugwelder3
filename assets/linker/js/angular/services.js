jumplink.magentoweb.factory("ProductService", function($sails) {
  $sails.get("/product/5", function (data) {
      console.log(data);
      //$scope.bars = data;
    });
});

jumplink.magentoweb.factory("SessionService", function() {
  return {
    get: function(key) {
      return sessionStorage.getItem(key);
    },
    set: function(key, val) {
      return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
      return sessionStorage.removeItem(key);
    },
  };
});

jumplink.magentoweb.factory("AuthenticationService", function($http, $sanitize, $sails, SessionService, NotifyService, CSRF_TOKEN) {
  
  var cacheSession = function(data) {

    if(typeof(data._id) === "undefined")
      data._id = data.id;

    SessionService.set('authenticated', true);
    SessionService.set('name', data.name);
    SessionService.set('email', data.email);
    SessionService.set('color', data.color);
    SessionService.set('_id', data._id);
  };

  var uncacheSession = function() {
    SessionService.unset('authenticated');
    SessionService.unset('name');
    SessionService.unset('email');
    SessionService.unset('color');
    SessionService.unset('_id');
  };

  var loginError = function(response) {
    //NotifyService.show_response(response);
    NotifyService.show("Error", response, "danger");
  };

  var sanitizeCredentials = function(credentials) {
    return {
      email: $sanitize(credentials.email),
      password: $sanitize(credentials.password),
      _id: $sanitize(credentials._id),
      _csrf: CSRF_TOKEN
    }
  };

  var getUser = function() {
    return {
      name: SessionService.get('name'),
      email: SessionService.get('email'),
      color: SessionService.get('color'),
      _id: SessionService.get('_id')
    }
  }

  return {
    signin: function(credentials, cb) {
      var sanitized_credentials = sanitizeCredentials(credentials);
      $sails.post("/session", sanitized_credentials, function (response) {
        if(response.authenticated === true) {
          cacheSession (response.user);
          cb(true, response.user);
        } else {
          NotifyService.show("Error", response, "danger");
          cb(false, null);
        }
      });      
    },

    signout: function(cb) {
      var user = getUser();
      $sails.delete("/session/"+user._id, function (response) {
        if(response.authenticated === false) {
          uncacheSession ();
          cb(true);
        } else {
          NotifyService.show("Error", "Can't singn out "+user.name, "danger");
          cb(false);
        }
      });
    },

    isSignin: function() {
      return SessionService.get('authenticated');
    },
    getUser: getUser
  }
});