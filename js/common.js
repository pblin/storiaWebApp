define([
  'jquery',
  'underscore',
  'backbone'
],
function ($, _, Backbone) {
    var Common = {

        isTouchDevice: function () {
            return 'ontouchstart' in document.documentElement;
        }
    };

    return Common;
});
