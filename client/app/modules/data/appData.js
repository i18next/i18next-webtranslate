define([
    'backbone',
    'namespace',
    'underscore'
],

function(Backbone, ns, _) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'data', append: true });


    // Required, return the module for AMD compliance
    return ns.modules;
});