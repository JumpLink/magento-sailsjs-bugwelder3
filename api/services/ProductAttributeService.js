var fs = require('fs');

// WORKAROUND
var attributes = require('./../models/ProductAttributes.json');

var generate = function (callback) {
  ProductAttribute.find().where().done(function (error, magentoProductAttibutes) {
    var result = {};
    var attributeCodes = Object.keys(magentoProductAttibutes['0']);
    for (var i = 0; i < attributeCodes.length; i++) {
      result[attributeCodes[i]] = {
        type       : magentoProductAttibutes['0'][attributeCodes[i]]['type']
      }
      if ( magentoProductAttibutes['0'][attributeCodes[i]]['unique'])
        result[attributeCodes[i]].unique = true;
      if ( magentoProductAttibutes['0'][attributeCodes[i]]['required'])
        result[attributeCodes[i]].required = true;
    };

    callback(error, result);
  });
}


var saveToFile = function (attribute, callback) {
  var outputFilename = './api/models/ProductAttributes.json'; 
  fs.writeFile(outputFilename, JSON.stringify(attribute, null, 4), function(err) {
    if(err) {
      console.log(err);
      callback(err, null);
    } else {
      sails.log.info("JSON saved to "+outputFilename);
      callback(err, outputFilename);
    }
  });
}

var generateAndSaveToFile = function (callback) {
  async.waterfall([
      generate
    , saveToFile
  ], callback);
}

var getAttributeOptions = function (attributeCode) {
  return attributes[attributeCode];
}

// Set all attributes they are required and currently not set
var setRequiredAttributes = function (productAttribute, options) {
  if ( productAttribute === 'undefined' && options.required) {
    sails.log.info("repair Attribute");
    sails.log.info(productAttribute);
    switch (options.required) {
      case "string":
      case "text":
        productAttribute = "";
      break;
      case "weight":
        productAttribute = 0;
      break;
      case "date":
        productAttribute = 0;
      break;
    }
  }
  return productAttribute;
}

// TODO default value from attributeset
var makeProductValid = function (product, callback) {
  var attributeCodes = Object.keys(product);
  for (var i = 0; i < attributeCodes.length; i++) {
    var options = getAttributeOptions(attributeCodes[i]);
    product[attributeCodes[i]] = setRequiredAttributes (product[attributeCodes[i]], options);
    // remove attributes they are null
    if ( product[attributeCodes[i]] === null) {
      delete product[attributeCodes[i]];
    }
  };
  
  callback (null, product);
}

module.exports = {
    generate              : generate
  , saveToFile            : saveToFile
  , generateAndSaveToFile : generateAndSaveToFile
  , attributes            : attributes // WORKAROUND
  , makeProductValid      : makeProductValid
}