define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _,  ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'ratingTemplate', append: false });

    module.Models.RatingTemplate = ns.Model.extend({
        modelName: 'ratingTemplate',

        url: function() {
            if (this.isNew()) {
                return "data/ratingtemplate/";
            } else {
                return "data/ratingtemplate/" + this.id;
            }
        },

        initialize: function(options) {
            if (arguments.length > 1) options = arguments[1];
            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;

            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        parse: function(res) {
            return res.response ? res.response.template : res;
        }
    });

    module.Collections.RatingTemplates = ns.Collection.extend({
        url: function(){
            return "data/ratingtemplates";
        },
        
        model: module.Models.RatingTemplate,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.titles;
        },

        comparator: function(templ) {
            return templ.get('title');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});