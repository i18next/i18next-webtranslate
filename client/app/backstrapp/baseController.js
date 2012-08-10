define([
    'underscore',  
    'backbone'
],

function(_, Backbone) {

    var Controller = Backbone.Model.extend({

        navigate: function(fragment, args, options) {
            if (!_.isArray(args)) {
                options = args || {};
                args = [];
            }

            options = options || {};

            // call route function with provided args
            if (this[fragment]) {
                this[fragment].apply(this, args);
            } else { 
                options.trigger = true;

                for (var i = 0, len = args.length; i < len; i++) {
                    fragment = fragment + '/' + args[i];
                }
            }

            Backbone.history.navigate(fragment, options);
        }
        
    });

    return Controller;

});