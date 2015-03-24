define([
  'backbone',
  'underscore',
  'backbone_websql',
  'modernizr'
  ],
  function (Backbone, _) {
    var zoomingModel = Backbone.Model.extend({
      el: $("#scholastic-right-content"),
      initialize: function() {
        // get the browser vendor prefixed attrs one time, rather than
        // every time we render
        this.styleAttrs = this.getModernizedAttrs();
      },

      defaults: {
        scale: 1,
        leftShift: 0,
        topShift: 0
      },

      setDefaults: function() {
        this.set(this.defaults);
      },

      getModernizedAttrs: function() {

        var attrs = {};
        attrs.transform = this.modernizrCssPrefix("transform");
        attrs.transformOrigin = this.modernizrCssPrefix("transformOrigin");
        return attrs;
      },

      modernizrCssPrefix: function(attr) {
        var str = Modernizr.prefixed(attr);
        if(str)
			return str.replace(/([A-Z])/g, function(str, m1){ 
			  return '-' + m1.toLowerCase(); 
			}).replace(/^ms-/,'-ms-');
      },


      getCSSProperties: function(attr) {
        var css = '';
        if(attr == 'scale'){
          css = this.styleAttrs.transform+":scale(" + this.get("scale").toString() + ");"+this.styleAttrs.transformOrigin +":0 0";
        }
        else if(attr == 'translate'){
          css[this.styleAttrs.transform] = "translate(" + this.get("leftShift") + "px, " + this.get("topShift") + "px) ";
          css[this.styleAttrs.transformOrigin] = "0 0";
        }
        
        return css;
      }
      
      


    });
    return zoomingModel;

  });   