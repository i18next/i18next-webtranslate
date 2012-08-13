define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;


    // Create a new module
    var module = ns.module();

    module.Models.Resource = ns.Model.extend({

        url: function(){
            return "/data/my/group/" + this.id;
        },

        initialize: function(options) { 
            if (arguments.length > 1) options = arguments[1];
            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
        }
    });

    module.Collections.Resources = ns.Collection.extend({
        url: "/data/my/groups",
        
        model: module.Models.Resource,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        comparator: function(resource) {
            return resource.get('key');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});