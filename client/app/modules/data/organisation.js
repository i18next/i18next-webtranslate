define([
    'backbone',
    'namespace',
    'underscore'
],

function(Backbone, ns, _) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'organisation', append: false });

    module.Models.Organisation = ns.Model.extend({
        modelName: 'organisation',

        url: function(){
            return "/data/my/organisation/" + this.id;
        },

        initialize: function(options) {
            var self = this;

            this.prepareModel();

            if (this.bindCQRS && this.useCQRS) this.bindCQRS(); 
        },

        parse: function(res) {
            var ret = res.response ? res.response.organisation : res;

            ret.credits = ret.credits || 0;
            ret.openCosts = ret.openCosts || 0;
            ret.bundles = ret.bundles || [];
            ret.invitations = ret.invitations || [];
            ret.ratingTemplates = ret.ratingTemplates || [];

            return ret;
        },

        prepareModel: function() {
            var Collections = ns.modules.organisation.Collections;
            var Models = ns.modules.organisation.Models;

            this.set('children', new Collections.Children(this.get('children'), { parent: this }));
            this.set('members', new Collections.Members(this.get('members'), { parent: this }));
            this.set('groups', new Collections.Groups(this.get('groups'), { parent: this }));
            this.set('archives', new Collections.Archives(null, { parent: this }));
            this.set('bundles', new Collections.Bundles(this.get('bundles'), { parent: this }));

            if (!this.has('credits')) this.set('credits', 0);
            if (!this.has('openCosts')) this.set('openCosts', 0);
            if (!this.has('invitations')) this.set('invitations', []);
            if (!this.has('ratingTemplates')) this.set('ratingTemplates', []);
        },

        getRatingTemplate: function(id, callback) {
            if (!callback) {
                callback = id;
                id = null;
            }
            var Models = ns.modules.organisation.Models;

            var template;
            if (id) {
                template = _.find(this.get('ratingTemplates'), function(r) {
                    return r.id === id;
                });

                if (!template) {
                    template = new Models.RatingTemplate({ id: id });
                    this.get('ratingTemplates').push(template);
                    template.fetch({ success: function() {
                        return callback(template);
                    }});
                } else {
                    return callback(template);
                }
            } else if (this.get('ratingTemplate') && this.get('ratingTemplate').id) {
                var orgTempId = this.get('ratingTemplate').id;
                template = _.find(this.get('ratingTemplates'), function(r) {
                    return r.id === orgTempId;
                });

                if (!template) {
                    template = new Models.RatingTemplate({ id: orgTempId });
                    this.get('ratingTemplates').push(template);
                    template.fetch({ success: function() {
                        return callback(template);
                    }});
                } else {
                    return callback(template);
                }
            } else {
                template = new Models.RatingTemplate();
                this.get('ratingTemplates').push(template);
                template.fetch({ success: function() {
                    return callback(template);
                }});
            }
        }
    });

    module.Collections.Organisations = ns.Collection.extend({
        url: "/data/my/organisations",
        
        model: module.Models.Organisation,

        parse: function(res) {
            return res.response.organisations;
        },

        comparator: function(org) {
            return org.get('name');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});