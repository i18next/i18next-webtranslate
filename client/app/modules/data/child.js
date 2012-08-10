define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _,  ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'child', append: false });

    module.Models.Child = ns.Model.extend({
        modelName: 'child',

        url: function(){
            return "/data/my/child/" + this.id;
        },

        initialize: function(options) {
            if (arguments.length > 1) options = arguments[1];
            
            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
            if (options && options.parent) this.parent = options.parent;

            var self = this;
            this.parent.getRatingTemplate(this.has('ratingTemplate') && this.get('ratingTemplate').id ? this.get('ratingTemplate').id : null, function(template) {
                self.set('ratingTemplate', template);
            });

            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        checkForActivation: function(callback) {
            if (!this.get('isActivated')) {
                if (this.parent.get('isBlocked')) {
                    bootbox.alert(ns.t('ns.msg:organisationBlocked'));
                    if (callback) { callback(false, false); }
                } else {
                    var hasCredits = this.parent.get('credits') >= 1;
                    if (hasCredits) {
                        bootbox.confirm(ns.t('ns.msg:activateChild'), function(result) {
                            if (callback) { callback(hasCredits, result); }
                        });
                    } else {
                        var found = _.find(this.parent.get('members').models, function(m) {
                            return m.get('isAdmin') === true && m.id === app.user.id;
                        });

                        if (found) {
                            bootbox.confirm(ns.t('ns.msg:purchaseCredits'), function(result) {
                                if (callback) { callback(hasCredits, result); }
                            });
                        } else {
                            bootbox.alert(ns.t('ns.msg:noCredits'));
                            if (callback) { callback(hasCredits, false); }
                        }
                    }
                }
            } else {
                if (callback) { callback(); }
            }
        }
    });

    module.Collections.Children = ns.Collection.extend({
        url: "/data/my/children",
        
        model: module.Models.Child,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.children;
        },

        comparator: function(child) {
            return child.get('fullname');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});