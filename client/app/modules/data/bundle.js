define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _,  ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'bundle', append: false });

    module.Models.Bundle = ns.Model.extend({
        modelName: 'bundle',

        url: function(){
            return "data/bundle/" + this.id;
        },

        initialize: function(options) {
            if (arguments.length > 1) options = arguments[1];

            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
            
            var Models = ns.modules.organisation.Models;

            var organisation = this.parent;

            var self = this;

            var found = _.find(organisation.get('members').models, function(m) {
                return m.id === self.get('purchasedBy').id;
            });

            var member = found || new Models.Member(this.get('purchasedBy'), { parent: this.parent });
            this.set('purchasedBy', member);

            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        toJSON: function() {
            var data =  _.clone(this.attributes);
            data.purchasedBy = _.clone(data.purchasedBy.attributes);

            return data;
        }
    });

    module.Collections.Bundles = ns.Collection.extend({
        url: function(){
            return "data/bundles/" + this.parent.id;
        },
        
        model: module.Models.Bundle,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.bundles;
        },

        comparator: function(bundle) {
            return moment().diff(moment(bundle.get('purchased')));
        }
    });

    // Required, return the module for AMD compliance
    return module;
});