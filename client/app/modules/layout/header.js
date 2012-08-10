define([
    "namespace",
    "backbone",
    "i18next"
],

function(ns, Backbone, i18next) {
    var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'header', append: true });

    var Controller = ns.Controller.extend({
        standard: function() {
            var view = new module.Views.Standard();
            ns.app.header.show(view);

        }
    });
    module.controller = new Controller();

    module.Views.Standard = ns.ItemView.extend({
        tagName: 'div',
        template: 'header',

        events: {
            'click .setDE' : 'ui_setLngToDE',
            'click .setFR' : 'ui_setLngToFR',
            'click .setIT' : 'ui_setLngToIT'
        },

        ui_setLngToDE: function(e) {
            e.preventDefault();

            app.setLng('de');
        },
        
        ui_setLngToFR: function(e) {
            e.preventDefault();

            app.setLng('fr');
        },

        ui_setLngToIT: function(e) {
            e.preventDefault();

            app.setLng('it');
        }
    });

    // Required, return the module for AMD compliance
    return module;

});