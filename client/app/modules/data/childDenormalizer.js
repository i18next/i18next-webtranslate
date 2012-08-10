define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
    var app = ns.app
      , organisation = appData.organisation;

    // helper
    function _getOrgChildren(evt) {
        var org = app.store.get('myOrganisations').get(evt.id);
        if (!org.has('children')) org.set('children', new module.Collections.Children(
            { parent: org }
        ));
        return org.get('children');
    }

    // Create a new module
    var module = ns.module({ name: 'childDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;
    
    // DENORMALIZERS
    var childAddedToOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: module.Models.Child,
        payloadValue: 'payload.child',
        collection: _getOrgChildren,

        // bindings
        forModel: 'child',
        forEvent: 'childAddedToOrganisation'
    });

    var childRemovedFromOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'childRemovedFromOrganisation'
    });

    var childUpdatedInOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        modelIdAttr: 'payload.childId',
        payloadValue: 'payload.child',

        // bindings
        forModel: 'child',
        forEvent: 'childUpdatedInOrganisation'
    });

    var ChildAddedToOrganisationGroupHandler = ns.EventDenormalizer.extend({
 
        handle: function(evt) {
            var data = evt.toJSON().payload;

            var organisation = this.collection().get(data.id);
            var group = organisation.get('groups').get(data.groupId);

            var child = organisation.get('children').get(data.child.id);
            child.groups = child.groups || [];
            child.groups.push(group);

            group.get('children').push(child);
            group.trigger('change:children', group);
        }

    });
       
    var childAddedToOrganisationGroupHandler = new ChildAddedToOrganisationGroupHandler({
        collection: function() { return app.store.get('myOrganisations'); },

        // bindings
        forModel: 'child',
        forEvent: 'childAddedToOrganisationGroup'
    });

    var ChildRemovedFromOrganisationGroupHandler = ns.EventDenormalizer.extend({
 
        handle: function(evt) {
            var data = evt.toJSON().payload;

            var organisation = this.collection().get(data.id);
            var group = organisation.get('groups').get(data.groupId);
            var child = organisation.get('children').get(data.child.id);
            if (child) {
                child.groups = child.groups || [];
                child.groups = _.without(child.groups, group);

                group.get('children').remove(child);
                group.trigger('change:children', group);
            }
        }

    });
       
    var childRemovedFromOrganisationGroupHandler = new ChildRemovedFromOrganisationGroupHandler({
        collection: function() { return app.store.get('myOrganisations'); },

        // bindings
        forModel: 'child',
        forEvent: 'childRemovedFromOrganisationGroup'
    });

    var ChildRatingSetToHandler = ns.EventDenormalizer.extend({
 
        apply: function(methode) {
            return  function(data, model) {
                if (!model.has('rates')) model.set('rates', {});
                var rates = model.get('rates');
                rates[data.rateId] = data.value;

                model.trigger('change:rates', model);
                model.trigger('evt_childRatingSetTo:' + data.rateId, data.value, model);
            };
        }

    });

    var childRatingSetToHandler = new ChildRatingSetToHandler({
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'childRatingSetTo'
    });

    var NoteOfChildRateUpdatedHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                if (!model.has('notes')) model.set('notes', {});
                var rates = model.get('notes');
                rates[data.rateId] = data.note;

                model.trigger('change:notes', model);
                model.trigger('evt_noteOfChildUpdated:' + data.rateId, data.note, model);
            };
        }

    });

    var noteOfChildRateUpdatedHandler = new NoteOfChildRateUpdatedHandler({
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'noteOfChildRateUpdated'
    });

    var CommentAddedToChildHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                if (!model.has('comments')) model.set('comments', []);
                var comments = model.get('comments');
                comments.push(data.comment);

                model.trigger('change:comments', model);
            };
        }

    });

    var commentAddedToChildHandler = new CommentAddedToChildHandler({
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'commentAddedToChild'
    });

    var AvatarUrlChangedForChildInOrganisationHandler = ns.EventDenormalizer.extend({
 
        apply: function(methode) {
            return  function(data, model) {
                model.set('avatarUrl', data.avatarUrl);
            };
        }

    });

    var avatarUrlChangedForChildInOrganisationHandler = new AvatarUrlChangedForChildInOrganisationHandler({
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'avatarUrlChangedForChildInOrganisation'
    });

    var ChildActivatedInOrganisationHandler = ns.EventDenormalizer.extend({
 
        apply: function(methode) {
            return  function(data, model) {
                model.set('isActivated', true);
            };
        }

    });

    var childActivatedInOrganisationHandler = new ChildActivatedInOrganisationHandler({
        modelIdAttr: 'payload.childId',

        // bindings
        forModel: 'child',
        forEvent: 'childActivatedInOrganisation'
    });

    // Required, return the module for AMD compliance
    return module;
});