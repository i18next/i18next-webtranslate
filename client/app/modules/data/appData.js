define([
    'backbone',
    'namespace',
    'underscore',
    './organisation',
    './group',
    './member',
    './child',
    './archive',
    './bundle',
    './user',
    './ratingTemplate'
],

function(Backbone, ns, _, organisation, group, member, child, archive, bundle, user, rTempl) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'organisation', append: true });

    _.extend(module.Models, organisation.Models);
    _.extend(module.Collections, organisation.Collections);

    _.extend(module.Models, group.Models);
    _.extend(module.Collections, group.Collections);

    _.extend(module.Models, member.Models);
    _.extend(module.Collections, member.Collections);

    _.extend(module.Models, child.Models);
    _.extend(module.Collections, child.Collections);

    _.extend(module.Models, archive.Models);
    _.extend(module.Collections, archive.Collections);

    _.extend(module.Models, bundle.Models);
    _.extend(module.Collections, bundle.Collections);

    _.extend(module.Models, rTempl.Models);
    _.extend(module.Collections, rTempl.Collections);

    var moduleUser = ns.module({ name: 'auth', append: true });

    _.extend(moduleUser.Models, user.Models);
    _.extend(moduleUser.Collections, user.Collections);


    // Required, return the module for AMD compliance
    return ns.modules;
});