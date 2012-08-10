define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
    var app = ns.app
      , organisation = appData.organisation;
    
    // helper
    function _getOrgMembers(evt) {
        var col = app.store.get('myOrganisations');
        var org = col.get(evt.id);
        if (!org) {
            org = col.getOrCreate(evt.id);
            org.fetch({ success: function() {
                org.prepareModel();
            }});
        }
        if (!org.has('members')) org.set('members', new module.Collections.Members(
            { parent: org }
        ));
        return org.get('members');
    }

    // Create a new module
    var module = ns.module({ name: 'memberDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;

    // DENORMALIZERS
    var memberAddedToOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: module.Models.Member,
        payloadValue: 'payload.member',
        collection: _getOrgMembers,
        onHandle: function(data, model) {
            // to retrieve more data like avatar...
            model.fetch();
        },

        // bindings
        forModel: 'member',
        forEvent: 'memberAddedToOrganisation'
    });

    var memberRemovedFromOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',
        modelIdAttr: 'payload.memberId',

        // bindings
        forModel: 'member',
        forEvent: 'memberRemovedFromOrganisation'
    });

    var MemberAddedToOrganisationGroupHandler = ns.EventDenormalizer.extend({
 
        handle: function(evt) {
            var data = evt.toJSON().payload;

            var organisation = this.collection().get(data.id);
            var group = organisation.get('groups').get(data.groupId);
            var member = organisation.get('members').get(data.member.id);
            member.groups = member.groups || [];
            member.groups.push(group);

            group.get('members').push(member);
            group.trigger('change', group);
            group.trigger('change:members', group.get('members'));
        }

    });
       
    var memberAddedToOrganisationGroupHandler = new MemberAddedToOrganisationGroupHandler({
        collection: function() { return app.store.get('myOrganisations'); },

        // bindings
        forModel: 'member',
        forEvent: 'memberAddedToOrganisationGroup'
    });

    var MemberRemovedFromOrganisationGroupHandler = ns.EventDenormalizer.extend({
 
        handle: function(evt) {
            var data = evt.toJSON().payload;

            var organisation = this.collection().get(data.id);
            var group = organisation.get('groups').get(data.groupId);
            var member = organisation.get('members').get(data.member.id);

            if (member) {
                group.get('members').remove(member);
                group.trigger('change', group);
                group.trigger('change:members', group.get('members'));
            }
        }

    });
       
    var memberRemovedFromOrganisationGroupHandler = new MemberRemovedFromOrganisationGroupHandler({
        collection: function() { return app.store.get('myOrganisations'); },

        // bindings
        forModel: 'member',
        forEvent: 'memberRemovedFromOrganisationGroup'
    });

    var setMemberAsAdminHandler = new Backbone.CQRS.EventDenormalizer({
        modelIdAttr: 'payload.memberId',

        // bindings
        forModel: 'member',
        forEvent: 'memberSetAsAdmin'
    });

    var unsetMemberAsAdminHandler = new Backbone.CQRS.EventDenormalizer({
        modelIdAttr: 'payload.memberId',

        // bindings
        forModel: 'member',
        forEvent: 'memberUnsetAsAdmin'
    });

    // Required, return the module for AMD compliance
    return module;
});