define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
    var app = ns.app
      , organisation = appData.organisation;

    // helper
    function _getOrgBundles(evt) {
        var org = app.store.get('myOrganisations').get(evt.id);
        if (!org.has('bundles')) org.set('bundles', new module.Collections.Bundles(
            { parent: org }
        ));
        return org.get('bundles');
    }

    // Create a new module
    var module = ns.module({ name: 'bundleDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;
    // DENORMALIZERS
    var BundlePurchasedForOrganisationHandler = ns.EventDenormalizer.extend({
        parse: function(evt) {
            var data = evt.toJSON().payload;
            data.id = data.purchaseId;
            delete data.purchaseId;
            return data;
        }
    });

    var bundlePurchasedForOrganisationHandler = new BundlePurchasedForOrganisationHandler({
        methode: 'create',
        model: module.Models.Bundle,
        // modelIdAttr: 'payload.purchaseId',
        // payloadValue: 'payload.member',
        collection: _getOrgBundles,

        // bindings
        forModel: 'bundle',
        forEvent: 'bundlePurchasedForOrganisation'
    });

    var BundlePaidForOrganisationHandler = ns.EventDenormalizer.extend({
        apply: function(methode) {
            return  function(data, model) {
                model.set('isPaid', true);
            };
        }
    });

    var bundlePaidForOrganisationHandler = new BundlePaidForOrganisationHandler({
        methode: 'update',
        model: module.Models.Bundle,
        modelIdAttr: 'payload.purchaseId',
        // payloadValue: 'payload.member',
        collection: _getOrgBundles,

        // bindings
        forModel: 'bundle',
        forEvent: 'bundlePaidForOrganisation'
    });

    // Required, return the module for AMD compliance
    return module;
});