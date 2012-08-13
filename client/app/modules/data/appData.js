define([
    'backbone',
    'namespace',
    'underscore',
     './resources'
],

function(Backbone, ns, _, resources) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'data', append: true });

    _.extend(module.Models, resources.Models);
    _.extend(module.Collections, resources.Collections);

    // Required, return the module for AMD compliance
    return ns.modules;
});