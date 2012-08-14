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

        onRender: function() {
            var self = this;

            function append(lng) {
                var eleStr = '<li><a href="javascript:;">' + 
                    ns.t('layout.header.language', {lng: lng}) + 
                    '</a></li>';

                var ele = $(eleStr);
                ele.on('click', function(e) {
                    e.preventDefault();
                    app.setLng(lng);
                });
                self.$('.languages').append(ele);                  
            }

            for (var i = 0, len = app.languages.length; i < len; i++) {
                append(app.languages[i]);
            }
        }
    });

    // Required, return the module for AMD compliance
    return module;

});