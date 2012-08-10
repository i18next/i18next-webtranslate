define([
    // Libs
    "jquery",
    "underscore",
    "backstrapp/backstrapp",
    "backbone",
    "handlebars",
    "i18next",
    "preconditions"
],

function($, _, backstrapp, Backbone, Handlebars, i18next) {

    Handlebars.registerHelper('t', function(i18n_key) {
       //i18n_key = Handlebars.Utils.escapeExpression(i18n_key);
       var result = i18next.t(i18n_key);

       return new Handlebars.SafeString(result);
    });

    Handlebars.registerHelper('tr', function(context, options) { 
        var opts = _.extend(options.hash, context);
        if (options.fn) opts.defaultValue = options.fn(context);

        var result = i18next.t(opts.key, opts);

        return new Handlebars.SafeString(result);
    });
  
    var ns = _.extend({

        modules: {},

        // Create a custom object with a nested Views object
        module: function(additionalProps) {
        var module = _.extend({ Views: {}, Models: {}, Collections: {} }, additionalProps);

        if (module.name && module.append === true) {
            this.modules[module.name] = module;
        }
      
        return module;
    }

    }, backstrapp);

    var app = ns.app;

    // override Backbone.History to track with google analytics
    Backbone.History.prototype.loadUrl = function(fragmentOverride) {       
        var fragment = this.fragment = this.getFragment(fragmentOverride);
        var matched = _.any(this.handlers, function(handler) {
          if (handler.route.test(fragment)) {
            handler.callback(fragment);
            return true;
          }
        });

        if (!/^\//.test(fragment)) fragment = '/' + fragment;
        if (window._gaq !== undefined) window._gaq.push(['_trackPageview', fragment]);

        app.log('info', '######\n# navigated to: ' + fragment);

        return matched;
    };

    return ns;
});
