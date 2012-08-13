define([
    'backbone',
    'namespace',
    'underscore',
    'jquery',
    'i18next',
     '../data/appData'
],

function(Backbone, ns, _, $, i18n) {
    var app = ns.app
      , Collections = ns.modules.data.Collections
      , Models = ns.modules.data.Models;


    // Create a new module
    var webTranslator = {};

    var defaults = {
        languages: ['dev'],
        namespaces: ['translation'],
        resUpdatePath: 'locales/change/__lng__/__ns__'
    };

    _.extend(webTranslator, {

        init: function(options, callback) {
            var self = this;

            this.options = _.extend(defaults, options || {});
            this.options.ns = { namespaces: this.options.namespaces };

            var lngsToLoad = [];
            for (var i = 0, l = this.options.languages.length; i < l; i++) {
                var pres = this._toLanguages(this.options.languages[i]);
                for (var y = 0, len = pres.length; y < len; y++) {
                    if (lngsToLoad.indexOf(pres[y]) < 0) {
                        lngsToLoad.push(pres[y]);
                    }
                }
            }
            this.options.languages = lngsToLoad;

            this.options.languages.sort();
            this.options.namespaces.sort();

            this.loadResources(this.options, function() {
                self.flatten(self.resStore, self.options);
                callback();
            });
        },

        _toLanguages: function(lng) {
            var languages = [];
            if (lng.indexOf('-') === 2 && lng.length === 5) {
                var parts = lng.split('-');

                lng = i18n.options.lowerCaseLng ? 
                    parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
                    parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();

                languages.push(lng);
                languages.push(lng.substr(0, 2));
            } else {
                languages.push(lng);
            }

            if (languages.indexOf(this.options.fallbackLng) === -1) languages.push(this.options.fallbackLng);

            return languages;
        },

        loadResources: function(options, callback) {
            var self = this;

            i18n.sync._fetch(options.languages, this.options, function(err, store) {
                self.resStore = self.resStore || {};
                _.extend(self.resStore, store);
                callback();
            }); 
        },

        flatten: function(store, options) {
            var flat = this.flat = []
              , lng, ns, node;

            function recurse(lng, ns, appendTo, obj, parentKey) {
                
                for (var m in obj) {
                    var kv
                      , value = obj[m]
                      , key = parentKey;

                    if (key.length > 0) {
                        key = key + ' .' + m;
                    } else {
                        key = m;
                    }

                    if (typeof value === 'string') {
                        kv = { 
                            id: key,
                            lng: lng,
                            ns: ns,
                            key: key,
                            value: value,
                            fallback: {
                                value: value,
                                lng: lng
                            }
                        };
                        appendTo.push(kv);
                    } else if (Object.prototype.toString.apply(value) === '[object Array]') {
                        kv = { 
                            id: key,
                            lng: lng,
                            ns: ns,
                            key: key,
                            value: value.join('\n'),
                            isArray: true,
                            fallback: {
                                value: value.join('\n'),
                                lng: lng,
                                isArray: true
                            }
                        };
                        appendTo.push(kv);
                    } else {
                        recurse(lng, ns, appendTo, value, key);
                    }
                }

            }

            // flatten
            for (lng in store) {
                node = store[lng];
                flat[lng] = {};

                for (ns in node) {
                    flat[lng][ns] = new Collections.Resources();

                    recurse(lng, ns, flat[lng][ns], node[ns], '');
                }
            }


            // add keys from unspecific, fallback
            function merge(lng, lngs) {
                for (var i = 0, len = lngs.length; i < len; i++) {
                    if (lngs[i] === lng) continue;

                    var source = flat[lngs[i]];
                    var target = flat[lng];

                    for (var ns in source) {
                        var sNS = source[ns];
                        var tNS = target[ns] || new Collections.Resources();

                        sNS.each(function(res) {
                            if (!tNS.get(res.id)) {
                                tNS.push({
                                    id: res.id,
                                    key: res.id,
                                    lng: lng,
                                    ns: ns,
                                    fallback: {
                                        value: res.get('value'),
                                        lng: lngs[i],
                                        isArray: res.get('isArray')
                                    }
                                });
                            }
                        });
                    }
                }
            }

            for (lng in flat) { 
                merge(lng, this._toLanguages(lng));
            }

        }

    });


    // Required, return the module for AMD compliance
    return webTranslator;
});