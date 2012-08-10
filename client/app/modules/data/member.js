define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'member', append: false });

    module.Models.Member = ns.Model.extend({
        modelName: 'member',

        url: function(){
            return "/data/member/" + this.id;
        },

        initialize: function(options) {
            if (arguments.length > 1) options = arguments[1];
            
            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        parse: function(res) {
            var ret = res;

            if (ret.response) ret = ret.response.member;
            return ret;
        }
    });

    module.Collections.Members = ns.Collection.extend({
        url: "/data/my/members",
        
        model: module.Models.Member,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.members;
        },

        comparator: function(member) {
            return member.get('fullname');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});