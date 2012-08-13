define([
    'backbone',
    'namespace',
    './resourceLoader'
],

function(Backbone, ns, resLoader) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'translationSample', append: false });

    var Controller = ns.Controller.extend({
        editor: function() {
            //if (!this.isAuth()) return;

            var view = new module.Views.Main();
            app.main.show(view);
        }
    });
    module.controller = new Controller();

    var Router = ns.Router.extend({
        appRoutes: {
            '': 'editor',
            'editor': 'editor'
        },
        
        controller: module.controller
    });
    var router = new Router();

    module.Views.Main = ns.Layout.extend({
        tagName: 'div',
        template: 'resourceEditorLayout',

        regions: {
            resources: '#resources'
        },

        initialize: function(options) {
        },

        events: {
            'click #load': 'ui_load'
        },

        ui_load: function(e) {
            e.preventDefault();

            var lng = this.$('#languages').val()
              , ns = this.$('#namespaces').val();

            var colView = new module.Views.Resources({
                collection: resLoader.flat[lng][ns],
                parent: this
            });

            this.resources.show(colView);
        },
        
        onRender: function() {
            var data = resLoader.options
              , i, len, opt, item;

            for (i = 0, len = data.languages.length; i < len; i++) {
                opt = data.languages[i];
                item = '<option value="' + opt + '">' + opt + '</option> ';
                this.$('#languages').append($(item));
            }

            for (i = 0, len = data.namespaces.length; i < len; i++) {
                opt = data.namespaces[i];
                item = '<option value="' + opt + '">' + opt + '</option> ';
                this.$('#namespaces').append($(item));
            }
        }
            
    });

    module.Views.ResourceItem = ns.ItemView.extend({
        tagName: 'li',
        template: 'resourceEditorItem',

        events: {
            //'click .navGroup': 'ui_navigateToGroup'
        },

        initialize: function(options) {
            // if (this.model && this.model.get('children')) {
            //     this.bindTo(this.model.get('children'), 'add', this.render, this);
            //     this.bindTo(this.model.get('children'), 'remove', this.render, this);
            // }
        },

        onRender: function() {
            var fallbackLng = this.model.get('fallback').lng;
            if (fallbackLng !== this.model.get('lng')) {
                this.$('.resource').addClass('isFallback');
                this.$('.key').addClass('isFallback');
                this.$('.fallbackBadge').removeClass('badge-success');
                this.$('.fallbackBadge').addClass('badge-warning');
            }
            if (fallbackLng === resLoader.options.fallbackLng &&
                this.model.get('lng').indexOf(resLoader.options.fallbackLng) < 0) {
                this.$('.resource').addClass('toFallback');
                this.$('.key').addClass('toFallback');
                 this.$('.fallbackBadge').removeClass('badge-success');
                this.$('.fallbackBadge').removeClass('badge-warning');
                this.$('.fallbackBadge').addClass('badge-error');
            }
        }
    });

    module.Views.Resources = ns.CollectionView.extend({
        tagName: 'ul',
        className: 'unstyled resources',
        itemView: module.Views.ResourceItem
    });

    // Required, return the module for AMD compliance
    return module;
});