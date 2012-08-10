define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
    var app = ns.app
      , organisation = appData.organisation;

    // Create a new module
    var module = ns.module({ name: 'archiveDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;

    // helper
    function _getArchive(evt) {
        var org = app.store.get('myOrganisations').get(evt.get('payload').organisation);
        if (!org.has('archives')) org.set('archives', new module.Collections.Archives(
            { parent: org }
        ));
        if (org.get('archives').length === 0) {
            org.get('archives').fetch();
        }
        return org.get('archives');
    }
    
    // DENORMALIZERS
    var archivedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        collection: _getArchive,

        // bindings
        forModel: 'archive',
        forEvent: 'archived'
    });

    var archiveDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',
        collection: _getArchive,

        // bindings
        forModel: 'archive',
        forEvent: 'archiveDeleted'
    });

    // Required, return the module for AMD compliance
    return module;
});