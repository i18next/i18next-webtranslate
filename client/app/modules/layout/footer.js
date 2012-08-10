define([
    "namespace",
    "backbone",
    "i18next"
],

function(ns, Backbone, i18next) {
    var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'footer', append: true });

    var Controller = ns.Controller.extend({
        standard: function() {
            var view = new module.Views.Standard();
            ns.app.footer.show(view);

        }
    });
    module.controller = new Controller();

    module.Views.Standard = ns.ItemView.extend({
        tagName: 'div',
        template: 'footer'
    });

    // Required, return the module for AMD compliance
    return module;

});