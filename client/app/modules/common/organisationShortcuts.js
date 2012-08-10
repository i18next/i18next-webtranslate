define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _, ns) {
	var app = ns.app;

    var Shortcut  = ns.ItemView.extend({

        tagName: 'span',
        template: 'organisationShortcuts',

        initialize: function(options) {
            this.collection = app.store.get('myOrganisations');
            this.title = options.title;
        },

        ui_navigateToGroup: function(e, group) {
            if (e) e.preventDefault();

            if (Backbone.history.fragment.indexOf('groupLists/') >= 0) {
                Backbone.history.navigate('groupLists/' + group.id, { trigger: true });
            } else if (Backbone.history.fragment.indexOf('groupPhoneAlarmList/') >= 0) {
                Backbone.history.navigate('groupPhoneAlarmList/' + group.id, { trigger: true });
            } else if (Backbone.history.fragment.indexOf('groupPhoneList/') >= 0) {
                Backbone.history.navigate('groupPhoneList/' + group.id, { trigger: true });
            } else if (Backbone.history.fragment.indexOf('groupAddressList/') >= 0) {
                Backbone.history.navigate('groupAddressList/' + group.id, { trigger: true });
            } else if (Backbone.history.fragment.indexOf('groupNoteList/') >= 0) {
                Backbone.history.navigate('groupNoteList/' + group.id, { trigger: true });
            } else {
                Backbone.history.navigate('group/' + group.id, { trigger: true });
            }
        },

        onRender: function() {
            var self = this;

            this.$('.linkText').html(this.title);

            this.collection.forEach(function(org) {
                self.$('.dropdown-menu').append(self.renderOrganisation(org));
            });
        },

        renderOrganisation: function(org) {
            var cont = $('<ul />');

            var orgLink = $('<li class="dropdown-organisation"><a href="/#organisation/' + 
                org.id + '">' + org.get('name') + '</a></li>');

            var sep = $('<li class="divider" />');

            cont.append(orgLink);
            if (org.has('groups')) cont.append(this.renderGroups(org.get('groups')));
            cont.append(sep);

            return cont.children();
        },

        renderGroups: function(groups) {
            var self = this;

            var cont = $('<ul />');

            groups.forEach(function(group) {
                var el = $('<li class="dropdown-group"><a href="javascript:;">' + group.get('name') + '</a></li>');
                el.click(function(e) {
                    self.ui_navigateToGroup(e, group);
                });
                cont.append(el);
            });

            return cont.children();
        }

    });

    // Required, return the module for AMD compliance
    return Shortcut;
});