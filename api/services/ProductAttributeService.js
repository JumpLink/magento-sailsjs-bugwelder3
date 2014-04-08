var fs = require('fs');

// WORKAROUND
var attributes = require('./../models/ProductAttributes.json');

var generate = function (callback) {
  ProductAttribute.find().where().done(function (error, magentoProductAttibutes) {
    var result = {};
    var attributeCodes = Object.keys(magentoProductAttibutes['0']);
    for (var i = 0; i < attributeCodes.length; i++) {
      result[attributeCodes[i]] = {};
      switch (magentoProductAttibutes['0'][attributeCodes[i]]['type']) {
        case 'array of integer':
        case 'array of float':
        case 'array of string':
        case 'multiselect':
          result[attributeCodes[i]].type = 'array';
        break;
        case 'select':
          result[attributeCodes[i]].type = 'integer';
        break;
        case 'tier_price':
        case 'stock_data':
          result[attributeCodes[i]].type = 'json';
        break;
        case 'price':
        case 'weight':
          result[attributeCodes[i]].type = 'float';
        break;
        default:
          result[attributeCodes[i]].type = magentoProductAttibutes['0'][attributeCodes[i]]['type'];
        break;
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
  if (typeof(attributes[attributeCode]) === 'undefined') {
    sails.log.error("attribute code '"+attributeCode+"' not found in 'ProductAttributes.json', maybe you need to regenerate this json!");
    process.exit(1);
    return;
  } else {
    return attributes[attributeCode];
  }
}

// Set all attributes they are required and currently not set or null
var setRequiredAttributes = function (productAttribute, options) {
  if ( (productAttribute === 'undefined' || productAttribute === null) && options.required) {
    sails.log.info("repair Attribute");
    sails.log.info(productAttribute);
    switch (options.type) {
      case "string":
      case "text":
        productAttribute = "placeholder";
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
var makeProductCreateValid = function (product, callback) {
  var attributeCodes = Object.keys(product);
  for (var i = 0; i < attributeCodes.length; i++) {
    var options = getAttributeOptions(attributeCodes[i]);
    // remove attributes they are null if it is not required
    if ( product[attributeCodes[i]] === null || product[attributeCodes[i]] === 'undefined' ) {
      if (!options.required) {
        sails.log.debug("delete attributeCode: "+attributeCodes[i]+" with value: "+product[attributeCodes[i]]);
        delete product[attributeCodes[i]];
      } else {
        // Set all attributes they are required and currently not set
        product[attributeCodes[i]] = setRequiredAttributes (product[attributeCodes[i]], options);
      }
    }
  };
  callback (null, product);
}

var makeProductUpdateValid = function (product, callback) {
  var attributeCodes = Object.keys(product);
  for (var i = 0; i < attributeCodes.length; i++) {
    var options = getAttributeOptions(attributeCodes[i]);
    // remove attributes they are null
    if ( product[attributeCodes[i]] === null
      // or they are an empty array/object
      // || ( ( _.isArray(product[attributeCodes[i]]) || _.isObject(product[attributeCodes[i]]) ) && _.isEmpty(product[attributeCodes[i]]) )
    ) {
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
  , makeProductUpdateValid      : makeProductUpdateValid
  , makeProductCreateValid      : makeProductCreateValid
}