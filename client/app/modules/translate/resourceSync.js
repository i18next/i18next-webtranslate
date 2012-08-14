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

    function applyReplacement(str, replacementHash, nestedKey) {
        if (str.indexOf(i18n.options.interpolationPrefix) < 0) return str;

        i18n.functions.each(replacementHash, function(key, value) {
            if (typeof value === 'object') {
                str = applyReplacement(str, value, key);
            } else {
                str = str.replace(new RegExp([i18n.options.interpolationPrefix, nestedKey ? nestedKey + '.' + key : key, i18n.options.interpolationSuffix].join(''), 'g'), value);
            }
        });
        return str;
    }

    // Create a new module
    var webTranslator = {};

    var defaults = {
        languages: ['dev'],
        namespaces: ['translation'],
        resUpdatePath: 'locales/change/__lng__/__ns__',
        resRemovePath: 'locales/remove/__lng__/__ns__'
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

            this.i18nOptions = _.clone(i18n.options);

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
                            id: key.replace(new RegExp(' ', 'g'), ''),
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
                            id: key.replace(new RegExp(' ', 'g'), ''),
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
                            if (!tNS.get(res.id) && 
                                res.get('fallback').lng === res.get('lng')) {
                                tNS.push({
                                    id: res.id,
                                    key: res.get('key'),
                                    lng: lng,
                                    ns: ns,
                                    isArray: res.get('isArray'),
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

        },

        update: function(lng, ns, key, value, cb) {
            var self = this;

            var payload = {};
            payload[key] = value;

            var url = applyReplacement(this.options.resChangePath, { lng: lng, ns: ns });

            i18n.functions.ajax({
                url: url,
                type: i18n.options.sendType,
                data: payload,
                success: function(data, status, xhr) {
                    i18n.functions.log('posted change key \'' + key + '\' to: ' + url);

                    // update resStore
                    var keys = key.split('.');
                    var x = 0;
                    var val = self.resStore[lng][ns];
                    while (keys[x]) {
                        if (x === keys.length - 1) {
                            val = val[keys[x]] = value;
                        } else {
                            val = val[keys[x]] = val[keys[x]] || {};
                        }
                        x++;
                    }

                    // update flatten
                    var flat = self.flat[lng][ns].get(key);
                    if (!flat) {
                        var lngs = self._toLanguages(lng);

                        for (var i = 0, len = lngs.length; i < len; i++) {
                            if (lngs[i] === lng) continue;

                            var source = self.flat[lngs[i]][ns][key];
                            var target = self.flat[lng][ns].get(key);

                            if (!source || target) break;

                            self.flat[lng][ns].push({
                                id: source.id,
                                key: source.get('key'),
                                lng: lng,
                                ns: ns,
                                isArray: source.get('isArray'),
                                fallback: {
                                    value: source.get('value'),
                                    lng: lngs[i],
                                    isArray: source.get('isArray')
                                }
                            });
                        }

                        flat = self.flat[lng][ns].get(key);
                        if (!flat) {
                            var k = key.split('.').join(' .');
                            self.flat[lng][ns].push({
                                id: key,
                                key: k,
                                lng: lng,
                                ns: ns,
                                value: '',
                                isArray: false,
                                fallback: {
                                    value: '',
                                    lng: lng,
                                    isArray: false
                                }
                            }); 
                        }
                    } else {
                        flat.set('value', value);
                    }

                    if (cb) cb(null);
                },
                error : function(xhr, status, error) {
                    i18n.functions.log('failed change key \'' + key + '\' to: ' + url);
                    if (cb) cb(error);
                },
                dataType: "json",
                async : i18n.options.postAsync
            });
        },

        remove: function(lng, ns, key, value, cb) {
            var self = this;

            var payload = {};
            payload[key] = value;

            var url = applyReplacement(this.options.resRemovePath, { lng: lng, ns: ns });

            i18n.functions.ajax({
                url: url,
                type: i18n.options.sendType,
                data: payload,
                success: function(data, status, xhr) {
                    i18n.functions.log('posted remove key \'' + key + '\' to: ' + url);

                    // update resStore
                    var keys = key.split('.');
                    var x = 0;
                    var val = self.resStore[lng][ns];
                    while (keys[x]) {
                        if (x === keys.length - 1) {
                            delete val[keys[x]];
                        } else {
                            val = val[keys[x]] = val[keys[x]] || {};
                        }
                        x++;
                    }

                    // update flatten
                    var flat = self.flat[lng][ns].get(key);
                    flat.destroy();

                    if (cb) cb(null);
                },
                error : function(xhr, status, error) {
                    i18n.functions.log('failed remove key \'' + key + '\' to: ' + url);
                    if (cb) cb(error);
                },
                dataType: "json",
                async : i18n.options.postAsync
            });
        }

    });


    // Required, return the module for AMD compliance
    return webTranslator;
});