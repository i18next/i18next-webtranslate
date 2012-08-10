define([
  'underscore',  
  'backbone'
],

function(_, Backbone) {

    var Collection = Backbone.Collection.extend({
    
        // fetch list without overwriting existing objects (copied from backbone's fetch())
        fetchNew: function(options) {
            options = options || {};
            var collection = this,
                success = options.success;
            options.success = function(resp, status, xhr) {
                _(collection.parse(resp, xhr)).each(function(item) {
                    if (!collection.get(item.id)) {
                        collection.add(item, {silent:true});
                    }
                });
                if (!options.silent) collection.trigger('reset', collection, options);
                if (success) success(collection, resp);
            };
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },
        
        // will get existing model or create a new model  
        // __Example:__
        //
        //     var myModel = myCollection.getOrCreate(myModelsId);
        getOrCreate: function(modelId, autoAdd) {
            autoAdd = autoAdd || true;

            var model = this.get(modelId);
            if (!model) {
                model = new this.model({ id: modelId});
                if (autoAdd) this.add(model);
            }
            return model;
        }
        
    });

    return Collection;

});