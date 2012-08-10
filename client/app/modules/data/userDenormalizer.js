define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'userDenormalizers', append: false });
    
    // DENORMALIZERS  
    var userProfileUpdatedHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'user',
        forEvent: 'userProfileUpdated'
    });
       
    var avatarUrlChangedForMemberHandler = new Backbone.CQRS.EventDenormalizer({
        // bindings
        forModel: 'user',
        forEvent: 'avatarUrlChangedForMember'
    });

    var ChildBookmarkAddedHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                if (!model.has('childrenBookmarks')) model.set('childrenBookmarks', []);

                var childrenBookmarks = model.get('childrenBookmarks');
                var childrenBookmark = _.find(childrenBookmarks, function(c) {
                    return c.id === data.childId && c.organisationId === data.organisationId;
                });

                if (!childrenBookmark) {
                    childrenBookmarks.push({ id: data.childId, organisationId: data.organisationId });
                    app.user.trigger('change:bookmarks', childrenBookmarks);
                }
            };
        }

    });
       
    var childBookmarkAddedHandler = new ChildBookmarkAddedHandler({
        // bindings
        forModel: 'user',
        forEvent: 'childBookmarkAdded'
    });

    var ChildBookmarkRemovedHandler = ns.EventDenormalizer.extend({

        apply: function(methode) {
            return  function(data, model) {
                if (!model.has('childrenBookmarks')) return;

                var childrenBookmarks = model.get('childrenBookmarks');

                var foundAt;
                var item = _.find(childrenBookmarks, function(c, i) {
                    var found = c.id === data.childId && c.organisationId === data.organisationId;
                    if (found) foundAt = i;
                });

                if (foundAt > -1) {
                    childrenBookmarks.splice(foundAt, 1);

                    app.user.trigger('change:bookmarks', childrenBookmarks);
                }
            };
        }

    });
       
    var childBookmarkRemovedHandler = new ChildBookmarkRemovedHandler({
        // bindings
        forModel: 'user',
        forEvent: 'childBookmarkRemoved'
    });

    // Required, return the module for AMD compliance
    return module;
});