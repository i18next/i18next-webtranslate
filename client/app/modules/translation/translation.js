define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'translationSample', append: false });

    var Controller = ns.Controller.extend({
        trans: function() {
            //if (!this.isAuth()) return;

            var view = new module.Views.Main();
            app.main.show(view);
        }
    });
    module.controller = new Controller();

    var Router = ns.Router.extend({
        appRoutes: {
            '': 'trans',
            'trans': 'trans'
        },
        
        controller: module.controller
    });
    var router = new Router();

    module.Views.Main = ns.ItemView.extend({
        tagName: 'div',
        template: 'translation',

        initialize: function() {
            this.model = new Backbone.Model({ addFromModel: 'and added from model' });
        },
        
        onRender: function() {
            this.$('.i18nContainer').i18n();
            this.$('.i18n').text(ns.t('trans.sample.nsT'));
        }
            
    });

    // Required, return the module for AMD compliance
    return module;
});