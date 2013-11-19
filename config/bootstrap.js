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
          cb(null, attributes);
        }
      }); 
    })
  });


  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();
};