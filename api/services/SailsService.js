var Controller = {
  find      : require(__dirname+'/../../node_modules/sails/lib/hooks/controllers/controller.find.js')
  , create  : require(__dirname+'/../../node_modules/sails/lib/hooks/controllers/controller.create.js')
  , update  : require(__dirname+'/../../node_modules/sails/lib/hooks/controllers/controller.update.js')
  , destroy : require(__dirname+'/../../node_modules/sails/lib/hooks/controllers/controller.destroy.js')
};

module.exports = {
  Controller : Controller
}