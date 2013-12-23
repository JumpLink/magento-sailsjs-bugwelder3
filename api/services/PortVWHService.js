const MWST = 1.19; // VAT
const EURO = 1.25;

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Source: http://stackoverflow.com/questions/4994201/is-object-empty
 */
var isEmpty = function (obj) {
  //sails.log.debug(typeof(obj));
  if(typeof(obj) === 'undefined')
    return true;

  if(typeof(obj) === 'number')
    return false;

  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length && obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and toValue enumeration bugs in IE < 9
  for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

function get_number_or_null(value) {
  var tmp_number = parseInt(value,10);
  if ( isNaN(tmp_number) ) {
    return 0;
  }
  return tmp_number;
}

function get_float_or_null(value) {
  var tmp_number = parseFloat(value,10);
  if ( isNaN(tmp_number) ) {
    return 0;
  }
  return tmp_number;
}

function price_round(num, decimals){
  if(typeof(decimals)==='undefined')
    decimals = 2;
  num = get_float_or_null(num);
  return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}

var portAvailabilitymessagecode = function (availabilitymessagecode) {
  var stock_vwheritage_availabilitymessagecode = get_number_or_null(availabilitymessagecode);

  switch (stock_vwheritage_availabilitymessagecode) {
    case 1: // "Not currently available"
            stock_vwheritage_availabilitymessagecode = 45;
    break;
    case 2: // "Available soon, date to be confirmed"
            stock_vwheritage_availabilitymessagecode = 46;
    break;
    case 3: // "Due in one week"
            stock_vwheritage_availabilitymessagecode = 47;
    break;
    case 4: // "Available in [dueWeeks] weeks"
            stock_vwheritage_availabilitymessagecode = 48;
    break;
  }
  return stock_vwheritage_availabilitymessagecode;
}

var portApplicationsEnglish = function (applications) {
  var result = "<b>For Vehicles:</b><br><ul>";
  for (var a = applications.length - 1; a >= 0; a--) {
    result += "<li>"+applications[a]+"</li>";
  }
  result += "</ul>";
  return result;
}

var portFittinginfoEnglish = function (fittinginfo) {
  var result = "";
  if(fittinginfo && fittinginfo.length > 5) {
    result += "<br><b>Fitting Info:</b>"+fittinginfo;
  }
  return result;
}

/**
 * Wenn cost_price größer ist als 70% vom retail_price und kleiner als 80% vom retail_price: 5%, 15%, 15%
 * Andernfalls wenn weniger als 20% Profit, kein Rabatt. 
 */
var portGrouPrice = function () {

}

/**
 * English language specific Stuff 
 */
var portToMagentoProductEnglish = function (product) {
  var result = {};
  if (typeof(product.id) !== 'undefined') {
    product.id = parseInt(product.id);
  }
  if (typeof(product.sku) !== 'undefined') {

  }
  if (typeof(product.metrics) !== 'undefined') {
    result.metrics = product.metrics; // TODO port
  }
  if (typeof(product.fittinginfo) !== 'undefined') {
    result.fittinginfo = portFittinginfoEnglish(product.fittinginfo);
  }
  if (typeof(product.quality) !== 'undefined') {
    result.quality = product.quality;
  }
  if (typeof(product.originaldescription) !== 'undefined') {

  }
  if (typeof(product.applications) !== 'undefined') {
    result.applications = portApplicationsEnglish(product.applications);
  }
  if (typeof(product.name) !== 'undefined') {
    result.name = product.name;
  }
  if (typeof(product.free_stock_quantity) !== 'undefined') {

  }
  if (typeof(product.dueweeks) !== 'undefined') {

  }
  if (typeof(product.availability_message_code) !== 'undefined') {
    delete product.availability_message_code;
  }
  if (typeof(product.retail_price) !== 'undefined') {

  }
  if (typeof(product.cost_price) !== 'undefined') {

  }
  if (typeof(product.price_2) !== 'undefined') {

  }
  if (typeof(product.price_3) !== 'undefined') {

  }
  if (typeof(product.price_4) !== 'undefined') {

  }
  return removeUnsetted(result);
};

/**
 * Stuff like price and stock
 */
var portToMagentoProductDefaults = function (product, include_groupprice) {
  var result = {};

  if (typeof(product.id) !== 'undefined') {
    result.vwh_id = parseInt(product.id);
  }
  if (typeof(product.sku) !== 'undefined') {
    result.sku = product.sku;
  }
  if (typeof(product.metrics) !== 'undefined') {

  }
  if (typeof(product.fittinginfo) !== 'undefined') {

  }
  if (typeof(product.quality) !== 'undefined') {

  }
  if (typeof(product.originaldescription) !== 'undefined') {

  }
  if (typeof(product.applications) !== 'undefined') {

  }
  if (typeof(product.name) !== 'undefined') {

  }
  if (typeof(product.free_stock_quantity) !== 'undefined') {
    result.stock_vwheritage_qty = product.free_stock_quantity;
  }
  if (typeof(product.dueweeks) !== 'undefined') {
    result.stock_vwheritage_dueweeks = product.dueweeks;
  }
  if (typeof(product.availability_message_code) !== 'undefined') {
    result.stock_vwheritage_messagecode = portAvailabilitymessagecode(product.availability_message_code);
  }
  if (typeof(product.retail_price) !== 'undefined') {
    result.recommend_price         = price_round(product.retail_price * MWST * EURO);
    result.recommend_price_netto   = price_round(product.retail_price * EURO);
  }
  if (typeof(product.cost_price) !== 'undefined') {
    result.vwheritage_price_pound  = price_round( product.cost_price, 2 );
    result.cost_price              = price_round(product.cost_price * EURO); // netto
  }
  /**
   * price_2 5%
   * TODO change tier_price to group_price
   */
  if (include_groupprice && typeof(product.price_2) !== 'undefined') {
    if (typeof(result.tier_price) === 'undefined') {
      result['tier_price'] = [];
    }
    var currentTierPrice = {
      customer_group_id: 4 // 4 = Rabattstufe 1
      , website: "all"
      , qty: 1 // Menge
      , price: price_round(product.price_2 * EURO * MWST) // (double)
    };
    result.tier_price.push(currentTierPrice);
  }
  /**
   * price_3 10%
   */
  if (include_groupprice && typeof(product.price_3) !== 'undefined') {
    if (typeof(result.tier_price) === 'undefined') {
      result['tier_price'] = [];
    }
    var currentTierPrice = {
      customer_group_id: 5 // 5 = Rabattstufe 2
      , website: "all"
      , qty: 1 // Menge
      , price: price_round(product.price_3 * EURO * MWST)
    };
    result.tier_price.push(currentTierPrice);
  }
  /**
   * price_4 20% If is able
   */
  if (include_groupprice && typeof(product.price_4) !== 'undefined') {
    if (typeof(result.tier_price) === 'undefined') {
      result['tier_price'] = [];
    }
    var currentTierPrice = {
      customer_group_id: 6 // 6 = Rabattstufe 3
      , website: "all"
      , qty: 1 // Menge
      , price: price_round(product.price_4 * EURO * MWST) 
    };
    result.tier_price.push(currentTierPrice);
  }
  return removeUnsetted(result);
};

var removeUnsetted = function (product) {
  for (var attribute in product) {
    if( isEmpty(product[attribute])) {
      //sails.log.debug("This is empty: ");
      //sails.log.debug(product[attribute]);
      delete product[attribute];
    }
  }
  return product;
}

var portToMagentoProduct = function (product, include_english, include_german, include_groupprice, callback) {
  var defaults = portToMagentoProductDefaults(product, include_groupprice);
  var result = defaults;
  result['stores'] = {};

  if(include_english) {
    var english = portToMagentoProductEnglish(product);
    if(!isEmpty(english))
      result['stores']['shop_en'] = english;
  }

  if(include_german) {
    var german = portToMagentoProducGerman(product);
    if(!isEmpty(english))
      result['stores']['shop_de'] = german;
  }
  callback(null, removeUnsetted(result));
}

module.exports = {
  portToMagentoProduct:portToMagentoProduct
  
}