if (typeof jumplink === 'undefined') {
  var jumplink = {};
}

jumplink.magentoweb = angular.module('jumplink.magentoweb', [
  'ngAnimate'
  , 'ngRoute'
  , 'ngSanitize'
  , 'ui.bootstrap'
  , 'gettext'
  , 'jumplink.notify'
  , 'ngSails'
  , 'colorpicker.module'
  , 'angular-underscore'
  , 'toggle-switch'
  , 'snap'
  , 'ng-iscroll'
]);

// languages
jumplink.magentoweb.run(function (gettextCatalog) {
    gettextCatalog.currentLanguage = 'de'; // default language
    gettextCatalog.debug = true; // Highlighting untranslated strings
});