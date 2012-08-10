define([
    'underscore',  
    'backbone'
],

function(_, Backbone) {

    var QS = Backbone.Model.extend({
    
        initialize: function() {
            this.params = {};
        },
        
        // (de)serialization functions
        deserialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].deserialize || _.identity;
            return f(value);
        },
        
        // serialization functions
        serialize: function(key, value) {
            var params = this.params,
                f = params[key] && params[key].serialize || _.identity;
            return f(value);
        },
        
        // convenience function to set a serialized value
        setSerialized: function(key, value) {
            o = {};
            o[key] = this.deserialize(key, value);
            this.set(o);
        }
                
    });

    var qs = new QS();


    originalGetFragment = Backbone.History.prototype.getFragment;

    Backbone.History.prototype.getFragment = function() {
        var fragment = originalGetFragment.apply(this, arguments),
            // intercept and get querystring
            parts = fragment.split('?'),
            query = parts[1];
        if (query) {
            parseQS(query);
        }
        return parts[0];
    };
    
    function parseQS(data) {
        data.split('&').forEach(function(pair) {
            var kv = pair.split('='),
                val = kv[1] ? decodeURIComponent(kv[1]) : null;
            if (kv.length > 1) {
                qs.setSerialized(kv[0], val);
            }
        });
    }

    return qs;

});