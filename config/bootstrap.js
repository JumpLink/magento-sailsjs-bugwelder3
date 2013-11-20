/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var fs = require('fs');

var createAdminUser = function (cb) {
  User.findOneByEmail("admin@admin.org", function foundUser(err, user) {
    if (err) return cb(err, null);
    if (!user) {
      sails.log.info("No Admin user found, create One");
      User.create({email:"admin@admin.org", name: "admin", color: "#000000", password: "sails-admin"}, function (err, result) {
        sails.log.info("err");
        sails.log.info(err);
        sails.log.info("result");
        sails.log.info(result);
        cb(err, result);
      })
    } else {
      sails.log.info("Admin already exists");
      cb(null, true);
    }
  })
  
}

module.exports.bootstrap = function (cb) {

  DNodeService.server().start(function(json) {

    // WORKAROUND
    ProductModelAttributesGeneratorService.generator.product(function (err, attributes) {
      fs.writeFile("./api/models/ProductAttributes.json", JSON.stringify(attributes, null, 4), function(err) {
        if(err) {
          sails.log.error(err);
          cb(err, null);
        } else {
          sails.log.info("./api/models/ProductAttributes.json saved.");
          createAdminUser(function(err, result) {
            sails.log.info("admin checked");
            cb(err, result);
          })
        }
      }); 
    })
  });


  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();
};