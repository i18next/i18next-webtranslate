define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
	var app = ns.app
      , organisation = appData.organisation;

    // helper
    function _getOrgGroups(evt) {
        var org = app.store.get('myOrganisations').get(evt.id);
        if (!org.has('groups')) org.set('groups', new module.Collections.Groups(
            { parent: org }
        ));
        return org.get('groups');
    }
    
    // Create a new module
    var module = ns.module({ name: 'groupDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;

    // DENORMALIZERS
    var groupAddedToOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: module.Models.Group,
        payloadValue: 'payload.group',
        collection: _getOrgGroups,

        // bindings
        forModel: 'group',
        forEvent: 'groupAddedToOrganisation'
    });

    var groupUpdatedInOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        modelIdAttr: 'payload.groupId',
        payloadValue: 'payload.group',

        // bindings
        forModel: 'group',
        forEvent: 'groupUpdatedInOrganisation'
    });

    var AvatarUrlChangedForGroupInOrganisationHandler = ns.EventDenormalizer.extend({
 
        apply: function(methode) {
            return  function(data, model) {
                model.set('avatarUrl', data.avatarUrl);
            };
        }

    });

    var avatarUrlChangedForGroupInOrganisationHandler = new AvatarUrlChangedForGroupInOrganisationHandler({
        modelIdAttr: 'payload.groupId',

        // bindings
        forModel: 'group',
        forEvent: 'avatarUrlChangedForGroupInOrganisation'
    });

    var PhoneAlarmOfGroupUpdatedHandler = ns.EventDenormalizer.extend({

        handle: function(evt) {
            var data = evt.toJSON().payload;

            var organisation = this.collection().get(data.id);
            var group = organisation.get('groups').get(data.groupId);

            var phoneAlarm = data.phoneAlarm;
            for(var m in phoneAlarm) {
                if (_.has(phoneAlarm, m)) {
                    var childrenCol = new module.Collections.Children([], { parent: organisation });
                    _.each(phoneAlarm[m], function(childId) {
                        var child = group.get('children').get(childId);
                        childrenCol.push(child);
                    });

                    phoneAlarm[m] = childrenCol;
                }
            }
            group.set('phoneAlarm', phoneAlarm);
        }

    });

    var phoneAlarmOfGroupUpdatedHandler = new PhoneAlarmOfGroupUpdatedHandler({
        modelIdAttr: 'payload.groupId',
        collection: function() { return app.store.get('myOrganisations'); },

        // bindings
        forModel: 'group',
        forEvent: 'phoneAlarmOfGroupUpdated'
    });

    // Required, return the module for AMD compliance
    return module;
});