define([
    'backbone',
    'namespace',
    './appData'
],

function(Backbone, ns, appData) {
    var app = ns.app
      , organisation = appData.organisation;

    // Create a new module
    var module = ns.module({ name: 'organisationDenormalizers', append: false });

    module.Models = organisation.Models;
    module.Collections = organisation.Collections;
    // DENORMALIZERS
    var organisationCreatedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: module.Models.Organisation,
        collection: function() { return app.store.get('myOrganisations'); },
        onHandle: function(data, model) {
            // to retrieve more data like avatar...
            var members = model.get('members').models;
            for(var i = 0, len = members.length; i < len; i++) {
                members[i].fetch();
            }
        },

        // bindings
        forModel: 'organisation',
        forEvent: 'organisationCreated'
    });

    var organisationUpdatedHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'organisation',
        forEvent: 'organisationUpdated'
    });

    var avatarUrlChangedForOrganisationHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'organisation',
        forEvent: 'avatarUrlChangedForOrganisation'
    });

    var CreditsAddedToOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.set('credits', model.get('credits') + data.credits);
            };
        }

    });

    var creditsAddedToOrganisationHandler = new CreditsAddedToOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'creditsAddedToOrganisation'
    });

    var CreditsRemovedFromOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.set('credits', model.get('credits') - data.credits);
                $('.top-right').notify({
                    message: { text: ns.t('ns.msg:creditUsed') }
                  , type: 'info'
                }).show();
                $('.top-right').notify({
                    message: { text: ns.t('ns.msg:remainingCredits', { credits: model.get('credits') }) }
                  , type: 'info'
                }).show();
            };
        }

    });

    var creditsRemovedFromOrganisationHandler = new CreditsRemovedFromOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'creditsRemovedFromOrganisation'
    });

    var CostsIncreasedForOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.set('openCosts', model.get('openCosts') + data.costs);
            };
        }

    });

    var costsIncreasedForOrganisationHandler = new CostsIncreasedForOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'costsIncreasedForOrganisation'
    });

    var CostsDecreasedForOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.set('openCosts', model.get('openCosts') - data.costs);
            };
        }

    });

    var costsDecreasedForOrganisationHandler = new CostsDecreasedForOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'costsDecreasedForOrganisation'
    });

    var organisationBlockedHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'organisation',
        forEvent: 'organisationBlocked'
    });

    var organisationUnblockedHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'organisation',
        forEvent: 'organisationUnblocked'
    });

    var MemberInvitedToOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.invitations = model.invitations || [];
                model.invitations.push(data.invitationCode);
            };
        }

    });

    var memberInvitedToOrganisationHandler = new MemberInvitedToOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'memberInvitedToOrganisation'
    });

    var InvitationExpiredInOrganisationHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                model.invitations = model.invitations || [];
                var index = _.indexOf(model.invitations, data.invitationCode);
                model.invitations.splice(index, 1);
            };
        }

    });

    var invitationExpiredInOrganisationHandler = new InvitationExpiredInOrganisationHandler({
        // bindings
        forModel: 'organisation',
        forEvent: 'invitationExpiredInOrganisation'
    });

    // Required, return the module for AMD compliance
    return module;
});