require([
    "namespace",

    // Libs
    "jquery",
    "backbone",
    "i18next",

    // Modules
    "modules/data/appData",
    "modules/translate/resourceSync",

    // common
    "modules/common/common",
    "modules/layout/layout",

    // pages
    "modules/translate/resourceEditor"
],

function(ns, $, Backbone, i18next, data, resSync) {

    // Shorthand the application namespace
    var app = ns.app;

    // turn on debugging
    app.debug = false;

    app.store = new Backbone.Model();

    app.setLng = function(lng) {
        lng = lng.substring(0,2);
        if (app.languages.indexOf(lng) < 0) lng = i18next.options.fallbackLng;

        i18next.setLng(lng, function() {
            if (app.header.currentView) app.header.currentView.render();
            if (app.main.currentView) app.main.currentView.render();
            if (app.footer.currentView) app.footer.currentView.render();
        });

        app.currentLng = lng;
    };

    app.addRegions({
        header: '.header-inner',
        main: '.main-inner',
        footer: '.footer-inner'
    });

    app.addInitializer(function(options) {
        $.support.placeholder = false;
        test = document.createElement('input');
        if('placeholder' in test) $.support.placeholder = true;
    });

    // global callback
    if (window.i18nextWT_onready) {
        window.i18nextWT_onready({
            addResourceSet: function(lng, res) {
                app.languages = app.languages || [];
                if (app.languages.indexOf(lng) < 0) app.languages.push(lng);

                var resSet = {};
                resSet[lng] = {};
                resSet[lng].translation = res;

                app.resStore = app.resStore || {};
                _.extend(app.resStore, resSet);
            },

            config: function(i18nextOpts, i18nextWTOpts) {
                _.extend(i18nextOpts, { resStore: app.resStore });

                app.addAsyncInitializer(function(options, done) {
                    i18next.init(i18nextOpts, function(t) { 
                        ns.t = t;
                        app.setLng(i18next.lng());
                        done();
                    });
                });

                app.addAsyncInitializer(function(options, done) {
                    resSync.init(i18nextWTOpts, function() {
                        done();
                    });
                });

            },

            start: function() {
                app.start(function() {
                    ns.modules.header.controller.standard();
                    ns.modules.footer.controller.standard();
                    
                    Backbone.history.start(/*{ pushState: true }*/);
                });
            }
        }); 
    }

});
