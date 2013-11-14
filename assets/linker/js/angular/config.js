if (typeof jumplink === 'undefined') {
  var jumplink = {};
}

jumplink.magentoweb = angular.module('jumplink.magentoweb', [
  'ngAnimate'
  , 'ngRoute'
  , 'ui.bootstrap'
  , 'gettext'
  , 'jumplink.notify'
  , 'jumplink.magentoweb_navbar',
  , 'ngSails'
]);

// languages
jumplink.magentoweb.run(function (gettextCatalog) {
    gettextCatalog.currentLanguage = 'de'; // default language
    gettextCatalog.debug = true; // Highlighting untranslated strings
});