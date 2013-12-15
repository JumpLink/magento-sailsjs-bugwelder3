// TODO check to use socket.io instead of dnode, on php site I could use http://elephant.io/#home . This would need to write own authorization function in config/socket.js

var dnode = require('dnode');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var red, blue, reset;
red   = '\033[31m';
blue  = '\033[34m';
reset = '\033[0m';


var listen;
var running;

var server = function(options) {

  var port = sails.config.dnode.port;

  var server = dnode(function (remote, conn) {
    this.dispatchEvent = function (eventName, args, cb) {
      
      sails.log.info("dispatchEvent DNode Server");
      sails.log.info(red+eventName+reset);
      sails.log.info(args);

      eventEmitter.emit(eventName, null, args);

      // var lookingfor = "";

      /* stock */
/*      lookingfor = "stock";
      if(eventName.indexOf(lookingfor) !== -1) {
        sails.log.info("");
        sails.log.info(red+lookingfor+reset);
        sails.log.info(blue+eventName+reset);
        sails.log.info(args);
      }
      switch (eventName) {
        case "cataloginventory_stock_item_save_commit_after":
          sails.log.info("");
          sails.log.info("inventory changed!");
          sails.log.info(blue+eventName+reset);
          sails.log.info(args);
        break;
      }*/

      /* product */
/*      lookingfor = "product";
      if(eventName.indexOf(lookingfor) !== -1) {
        sails.log.info("");
        sails.log.info(red+lookingfor+reset);
        sails.log.info(blue+eventName+reset);
        sails.log.info(args);
      }
      switch (eventName) {
        case "Mage_Catalog_Model_Product_Action":
          sails.log.info("");
          sails.log.info("product changed!");
          sails.log.info(blue+eventName+reset);
          sails.log.info(args);
        break;
      }*/

      /* customer */
/*      lookingfor = "customer";
      if(eventName.indexOf(lookingfor) !== -1) {
        sails.log.info("");
        sails.log.info(red+lookingfor+reset);
        sails.log.info(blue+eventName+reset);
        sails.log.info(args);
      }
      switch (eventName) {
        case "customer_register_success":
          sails.log.info("");
          sails.log.info(blue+eventName+reset);
          sails.log.info(args);
        break;
      }*/

      /* cart */
/*      lookingfor = "cart";
      if(eventName.indexOf(lookingfor) !== -1) {
        sails.log.info("");
        sails.log.info(red+lookingfor+reset);
        sails.log.info(blue+eventName+reset);
        sails.log.info(args);
      }
      switch (eventName) {
        case "controller_action_predispatch_checkout_cart_add":
        case "checkout_cart_add_product_complete":
        case "checkout_cart_update_item_complete":
        case "checkout_cart_product_add_after":
        case "checkout_cart_save_after":
        case "checkout_cart_product_update_after":
        case "checkout_cart_product_add_after":
        case "checkout_cart_product_add_after":
          sails.log.info("");
          sails.log.info("product add to card!");
          sails.log.info(blue+eventName+reset);
          sails.log.info(args);
        break;
        case "checkout_cart_update_items_after":
          sails.log.info("");
          sails.log.info("Warenkorb Update");
          sails.log.info(blue+eventName+reset);
          sails.log.info(args);
        break;   
      }*/
      cb();
    };
  });

  /*
   _____  _   _           _      
  |  __ \| \ | |         | |     
  | |  | |  \| | ___   __| | ___ 
  | |  | | . ` |/ _ \ / _` |/ _ \
  | |__| | |\  | (_) | (_| |  __/
  |_____/|_| \_|\___/ \__,_|\___|

  */
  //TODO use events, see issue #101: https://github.com/substack/dnode/issues/101
  var info = function() {
    //listen.on('local', function () {
    sails.log.info("");
    sails.log.info("Starting DNode Server...");
    sails.log.info(" _____  _   _           _      ");
    sails.log.info("|  __ \\| \\ | |         | |     ");
    sails.log.info("| |  | |  \\| | ___   __| | ___ ");
    sails.log.info("| |  | | . ` |/ _ \\ / _` |/ _ \\");
    sails.log.info("| |__| | |\\  | (_) | (_| |  __/");
    sails.log.info("|_____/|_| \\_|\\___/ \\__,_|\\___|");
    sails.log.info("");
    sails.log.info("listening on port "+port);
    //});
  }

  var start = function (cb) {
    if(running === true) {
      sails.log.info("DNode Server already running.. ");
      cb({started: false, status: 'running'});
    } else {
      listen = server.listen(port);
      running = true;
      info();
      cb({started: true, status: 'running'});
    }
  }

  return {
    start: start
  }
}
module.exports = {
  server : server
  , eventEmitter : eventEmitter
}