define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;


    // Create a new module
    var module = ns.module({ name: 'group', append: false });

    module.Models.Group = ns.Model.extend({
        modelName: 'group',

        url: function(){
            return "/data/my/group/" + this.id;
        },

        initialize: function(options) { 
            if (arguments.length > 1) options = arguments[1];

            var self = this;
            
            var Collections = ns.modules.organisation.Collections;

            if (options && options.collection && options.collection.parent) this.parent = options.collection.parent;
            
            if (this.parent) {
                var newChildren = new Collections.Children([], { parent: this.parent });

                var childrenInOrganisation = this.parent.get('children') || new Collections.Children();

                _.each(this.get('children'), function(child) {
                    var full = childrenInOrganisation.get(child.id || child);

                    if (full) {
                        full.groups = full.groups || [];
                        full.groups.push(self);
                    }

                    // switch them out
                    newChildren.push(full);
                });

                this.set('children', newChildren);

                if (this.has('phoneAlarm')) {
                    var phoneAlarm = this.get('phoneAlarm');

                    for(var m in phoneAlarm) {
                        if (_.has(phoneAlarm, m)) {
                            var childrenCol = new Collections.Children([], { parent: this.parent });
                            _.each(phoneAlarm[m], function(childId) {
                                var child = self.get('children').get(childId);
                                childrenCol.push(child);
                            });

                            phoneAlarm[m] = childrenCol;
                        }
                    }

                    this.set('phoneAlarm', phoneAlarm);
                }
            }

            if (this.parent) {
                var newMembers = new Collections.Members([], { parent: this });

                var memberInOrganisation = this.parent.get('members') || new Collections.Members();

                _.each(this.get('members'), function(member) {
                    var full = memberInOrganisation.get(member.id || member);

                    if (full) {
                        full.groups = full.groups || [];
                        full.groups.push(self);
                    }

                    // switch them out
                    newMembers.push(full);
                });
                    

                this.set('members', newMembers);
            }

            if (this.bindCQRS && this.useCQRS) this.bindCQRS();
        },

        getRatingTemplate: function(callback) {
            if (this.has('children') && this.get('children').length > 0) {
                return callback (this.get('children').first().get('ratingTemplate'));
            } else {
                return this.parent.getRatingTemplate(callback);
            }
        },

        isChildInPhoneAlarm: function(child) {
            if (this.has('phoneAlarm')) {
                var phoneAlarm = this.get('phoneAlarm');

                for(var m in phoneAlarm) {
                    if (_.has(phoneAlarm, m)) {
                        var found = _.find(phoneAlarm[m].models, function(ch) {
                            return ch.id === child.id;
                        });

                        if (found) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    });

    module.Collections.Groups = ns.Collection.extend({
        url: "/data/my/groups",
        
        model: module.Models.Group,

        initialize: function(models, options) {
            if (options && options.parent) this.parent = options.parent;
        },

        parse: function(res) {
            return res.response.groups;
        },

        comparator: function(group) {
            return group.get('name');
        }
    });

    // Required, return the module for AMD compliance
    return module;
});