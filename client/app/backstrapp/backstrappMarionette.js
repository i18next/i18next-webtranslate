define([
  'underscore',  
  'backbone',
  'marionette_async',
  'handlebars',
  './templateLoader'
],

function(_, Backbone, Marionette, Handlebars, Loader) {

    var ns = {}
      , mario = Backbone.Marionette;

    // append to ns
    ns.Marionette = mario;

    // layout
    ns.Layout = mario.Layout;
    ns.Region = mario.Region;

    // views
    mario.View.prototype.log = function(obj, action) {
        if (ns.app.debug !== true) return;

        var msg = '';

        if (this.template) {
            msg = obj.cid + '::' + this.template +
            ' --- ' + action.toUpperCase();
        }

        if (this.itemView) {
            msg = obj.cid + '::' + this.itemView.prototype.template + '_Collection' + 
            ' --- ' + this.collection.length + ' ITEMS ' + action.toUpperCase();
        }

        if (ns.app.log('info', msg, obj));
    };

    ns.Layout = mario.Layout.extend({
        constructor: function() {
            var self = this; 

            if (arguments.length > 0 && arguments[0].parent) {
                this.parent = arguments[0].parent;
                this.parent.on("item:before:close", function() {
                    self.close();
                });
            } 

            mario.Layout.prototype.constructor.apply(this, arguments);
            this.log(this, 'constructed');

            this.bindTo(this, 'show', function() { self.log(self, 'showed'); }, this);
        },

        render: function() {
             var deferrer = mario.Layout.prototype.render.apply(this);
             this.log(this, 'rendered');
             return deferrer;
        },

        close: function() {
             mario.Layout.prototype.close.apply(this);
             this.log(this, 'closed');
        }
    });

    ns.ItemView = mario.ItemView.extend({
        constructor: function() {
            var self = this; 

            if (arguments.length > 0 && arguments[0].parent) {
                this.parent = arguments[0].parent;
                this.parent.on("item:before:close", function() {
                    self.close();
                });
            } 

            mario.ItemView.prototype.constructor.apply(this, arguments);
            this.log(this, 'constructed');

            this.bindTo(this, 'show', function() { self.log(self, 'showed'); }, this);
        },

        render: function() {
             var deferrer = mario.ItemView.prototype.render.apply(this);
             this.log(this, 'rendered');
             return deferrer;
        },

        close: function() {
             mario.ItemView.prototype.close.apply(this);
             this.log(this, 'closed');
        }

    });
    
    ns.CollectionView = mario.CollectionView.extend({
        constructor: function() {
            var self = this; 

            if (arguments.length > 0 && arguments[0].parent) {
                this.parent = arguments[0].parent;
                this.parent.on("item:before:close", function() {
                    self.close();
                });
            }

            mario.CollectionView.prototype.constructor.apply(this, arguments);
            this.log(this, 'constructed');

            this.bindTo(this, 'show', function() { self.log(self, 'showed'); }, this);
        },

        render: function() {
             var deferrer = mario.CollectionView.prototype.render.apply(this);
             this.log(this, 'rendered');
             return deferrer;
        },

        close: function() {
             mario.CollectionView.prototype.close.apply(this);
             this.log(this, 'closed');
        }
    });
    ns.CompositeView = mario.CompositeView;

    // add async start to app
    mario.Application.prototype.origStart = mario.Application.prototype.start;

    _.extend(mario.Application.prototype, {
        asyncInitializers: [],
        addAsyncInitializer: function(fn) {
            this.asyncInitializers.push(fn);
        },
        start: function(options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = {};
            }
            options = options || {};

            var todo = this.asyncInitializers.length;
            function done() {
                todo--;

                if (!todo && cb) cb(); 
            }

            // initAsyncs
            for (var i = 0, len = todo; i < len; i++) {
                this.asyncInitializers[i](options, done);
            }

            this.origStart(options);
        }
    });

    // add an App
    ns.app = new mario.Application();
    ns.app.store = new Backbone.Model();
    ns.app.log = function(lvl, msg, src) {
        if (ns.app.debug !== true) return;
        if (window.console && window.console.log) {
            console.log(msg);
        }
    };
    ns.renderer = mario.Renderer;


    Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId, callback) {
        var self = this;

        Loader.fetchTemplate(templateId, function(tmpl) {
            var ret = (_.isFunction(tmpl)) ? tmpl : Handlebars.compile(tmpl);
            callback.call(self, ret);
        });      
    };

    var renderTemplate = function (template, data) {
        if (!template) return null;
        var rendering = template(data);
        //if ($.i18n && rendering && rendering.length > 2) $(rendering).i18n();
        return rendering;
    };

    ns.renderer.renderTemplate = renderTemplate;

    return ns;

});