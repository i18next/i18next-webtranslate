define([
    'backbone',
    'namespace',
    './resourceSync',
    'i18next'
],

function(Backbone, ns, resSync, i18n) {
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
                collection: resSync.flat[lng][ns],
                parent: this
            });

            this.resources.show(colView);
        },
        
        onRender: function() {
            var data = resSync.options
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

        initialize: function(options) {
            // if (this.model && this.model.get('children')) {
            //     this.bindTo(this.model.get('children'), 'add', this.render, this);
            //     this.bindTo(this.model.get('children'), 'remove', this.render, this);
            // }
        },

        events: {
            'click .edit': 'ui_edit',
            'click .editor-wrapper': 'ui_edit',
            'click .cancel': 'ui_cancelEdit',
            'click .save': 'ui_save',
            'click .test': 'ui_toggleTest',
            'click .refresh': 'ui_refreshTest'
        },

        ui_edit: function(e) {
            e.preventDefault();

            if (!this.$('.editor').val()) {
                this.$('.editor').val(this.model.get('fallback').value);
            }

            this.$('.editor').removeAttr('disabled');
            this.$('.editor').focus();
            this.$('.edit').hide();
            this.$('.editCommands').show();
        },

        ui_cancelEdit: function(e, noReplace) {
            if (e) e.preventDefault();

            this.$('.editor').attr('disabled', 'disabled');
            this.$('.edit').show();
            this.$('.editCommands').hide();


            if (!noReplace) {
                this.$('.editor').val(this.model.get('value'));
            }
        },

        ui_save: function(e) {
            if (e) e.preventDefault();

            var self = this;
            this.$('.editCommands button').attr('disabled', 'disabled');

            var raw = this.$('.editor').val()
              , array;

            if (this.model.get('isArray')) {
                array = raw.split('\n');
            }

            resSync.update(
                this.model.get('lng'),
                this.model.get('ns'),
                this.model.id,
                array || raw,
                function(err) {
                    self.model.set('value', raw);
                    self.$('.editCommands button').removeAttr('disabled');
                    self.ui_cancelEdit(undefined, true);
                }
            );
        },

        ui_toggleTest: function(e) {
            e.preventDefault();

            if (this.testing) {
                this.testing = false;
                this.$('.testSection').hide();
                this.$('.previewSection').show();
                this.resetI18n(function() {});
            } else {
                this.testing = true;
                this.$('.testSection').show();
                this.$('.previewSection').hide();

                this.ui_refreshTest();
            }
        },

        ui_refreshTest: function(e) {
            if (e) e.preventDefault();

            var self = this;

            var opts = {};
            var args = self.$('.i18nOptions').val().replace(new RegExp(' ', 'g'), '').split(/\n|\r/);
            for (var i = 0, len = args.length; i < len; i++) {
                var split = args[i].split('=');
                opts[split[0]] = split[1];
            }

            function test(t, o) {
                self.$('.translated').html(t(self.model.get('ns') + ':' + self.model.id, o));
            }

            if (!resSync.i18nDirty) {
                this.prepareI18n(function(t) {
                    test(t, opts);
                });
            } else {
                test(i18n.t, opts);
            }
        },

        prepareI18n: function(cb) {
            var self= this;

            i18n.init({
                resStore: resSync.resStore,
                lng: this.model.get('lng')
            }, function(t) {
                resSync.i18nDirty = true;
                cb(t);
            });
        },

        resetI18n: function(cb) {
            var self = this;

            i18n.init(resSync.i18nOptions, function(t) {
                resSync.i18nDirty = false;
                cb(t);
            });
        },

        onRender: function() {
            var fallbackLng = this.model.get('fallback').lng;
            if (fallbackLng !== this.model.get('lng')) {
                this.$('.resource').addClass('isFallback');
                this.$('.key').addClass('isFallback');
                this.$('.fallbackBadge').removeClass('badge-success');
                this.$('.fallbackBadge').addClass('badge-warning');
            }
            if (fallbackLng === resSync.options.fallbackLng &&
                this.model.get('lng').indexOf(resSync.options.fallbackLng) < 0) {
                this.$('.resource').addClass('toFallback');
                this.$('.key').addClass('toFallback');
                 this.$('.fallbackBadge').removeClass('badge-success');
                this.$('.fallbackBadge').removeClass('badge-warning');
                this.$('.fallbackBadge').addClass('badge-error');
            }
        }

        // todo on close reset i18n if dirty
    });

    module.Views.Resources = ns.CollectionView.extend({
        tagName: 'ul',
        className: 'unstyled resources',
        itemView: module.Views.ResourceItem
    });

    // Required, return the module for AMD compliance
    return module;
});