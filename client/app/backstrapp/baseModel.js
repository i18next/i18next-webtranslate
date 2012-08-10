define([
    'underscore',  
    'backbone'
],

function(_, Backbone) {

    var Model = Backbone.Model.extend({
    
        fetchNew: function(options) {
            options = options || {};
            var model = this,
                success = options.success;
            options.success = function(resp, status, xhr) {
                _(model.parse(resp, xhr)).each(function(item) {
                    if (!model.get(item.id)) {
                        model.add(item, {silent:true});
                    }
                });
                if (!options.silent) model.trigger('reset', model, options);
                if (success) success(model, resp);
            };
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        }
        
    });

    return Model;

});