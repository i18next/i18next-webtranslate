define([
    'backbone',
    'namespace',
    'underscore',
    'jquery',
    'i18next'
],

function(Backbone, ns, _, $, i18n) {
    var app = ns.app;

    // Create a new module
    var webTranslator = {};

    var defaults = {
        languages: ['dev'],
        namespaces: ['translation'],
        resUpdatePath: 'locales/change/__lng__/__ns__'
    };

    _.extend(webTranslator, {

        init: function(options, callback) {
            this.options = _.extend(defaults, options || {});
            this.options.ns = { namespaces: this.options.namespaces };

            this.loadResources(this.options, callback);
        },

        loadResources: function(options, callback) {
            var self = this;

            i18n.sync._fetch(options.languages, this.options, function(err, store) {
                self.resStore = self.resStore || {};
                _.extend(self.resStore, store);
                callback();
            }); 
        }

    });


    // Required, return the module for AMD compliance
    return webTranslator;
});