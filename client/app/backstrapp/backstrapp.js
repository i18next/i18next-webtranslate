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

	var ns = _.extend({}, BackstrappMarionette);

	ns.Collection = BaseCollection;
	ns.Model = BaseModel;
	ns.Controller = BaseController;
	ns.Router = baseRouter;
	ns.qs = qs;

	return ns;
});