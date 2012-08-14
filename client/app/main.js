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
        if (lng !== 'de' && lng !== 'fr' && lng !== 'it') lng = i18next.options.fallbackLng;

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





    // removes tooltips when navigating with browser's history (back and forward)
    // app.addInitializer(function(options) {
    //     var hash;
    //     setInterval(function() {
    //         if (location.hash != hash) {
    //             $('.tooltip').remove();
    //             hash = location.hash;
    //         }
    //     }, 100);
    // });

    // Treat the jQuery ready function as the entry point to the application.
    // Inside this function, kick-off all initialization, everything up to this
    // point should be definitions.
    // $(function() {
    //     // Define your master router on the application namespace and trigger all
    //     // navigation from this instance.
    //     app.start(function() {
    //         ns.modules.header.controller.standard();
    //         ns.modules.footer.controller.standard();
            
    //         Backbone.history.start(/*{ pushState: true }*/);
    //     });
    // });

    // global callback
    if (window.i18nextWT_onready) {
        window.i18nextWT_onready({
            addResourceSet: function(lng, res) {

            },

            config: function(i18nextOpts, i18nextWTOpts) {
                _.extend(i18nextOpts, { resStore: {} });

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
