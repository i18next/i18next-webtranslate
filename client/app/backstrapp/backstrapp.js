define([
	'underscore',
	'backbone',
    './backstrappMarionette',
    './baseCollection',
    './baseModel',
    './baseController',
    './baseRouter',
    './qs'
],

function(_, Backbone, BackstrappMarionette, BaseCollection, BaseModel, BaseController, baseRouter, qs) {

	// override Backbone sync
	Backbone.sync = function(method, model, options) {
        var type = methodMap[method];

        // __only change is here__ only allow get!
        if (type !== 'GET') {
            return options.success();
        } else {
            origSync(method, model, options);
        }
    };

    // Mappings from backbone to server methode.
    var methodMap = {
     'create': 'POST',
     'update': 'PUT',
     'delete': 'DELETE',
     'read': 'GET'
    };


    // bootstrap namespace
	var ns = _.extend({}, BackstrappMarionette);

	ns.Collection = BaseCollection;
	ns.Model = BaseModel;
	ns.Controller = BaseController;
	ns.Router = baseRouter;
	ns.qs = qs;

	return ns;
});