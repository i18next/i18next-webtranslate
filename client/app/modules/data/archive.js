define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _,  ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'archive', append: false });

    module.Models.Archive = ns.Model.extend({
        modelName: 'archive',

        url: function(){
            return "data/archives/" + this.id;
        },

        initialize: function(options) {
            if (arguments.length > 1) options = arguments[1];

            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
            
            var Models = ns.modules.organisation.Models;

            var child = new Models.Child(this.get('child'), { parent: this.parent });
            child.set('archive', this);
            this.set('child', child);

            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        toJSON: function() {
            var data =  _.clone(this.attributes);
            data.child = _.clone(data.child.attributes);

            return data;
        }
    });

    module.Collections.Archives = ns.Collection.extend({
        url: function(){
            return "data/archives/" + this.parent.id;
        },
        
        model: module.Models.Archive,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.archives;
        },

        comparator: function(archive) {
            return archive.get('archived');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});