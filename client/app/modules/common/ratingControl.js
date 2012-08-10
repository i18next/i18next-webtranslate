define([
    'backbone',
    'underscore',
    'namespace'
],

function(Backbone, _, ns) {
	var app = ns.app;

    var RatingControl  = ns.ItemView.extend({

        tagName: 'ul',
        template: 'ratingControl',

        className: 'rating unstyled',

        initialize: function(options) {
            this.rated = options.rated;
            this.bindTo(this.rated.child, 'evt_childRatingSetTo:' + this.rated.id, this.reset, this);
        },

        events: {
            'click li': 'ui_rated'
        },

        reset: function(value) {
            this.rated.value = value;
            this.render();
        },

        ui_rated: function(e) {
            e.preventDefault();

            if (this.rated.child && this.rated.child.has('archive')) return;

            var self = this;

            function rateChild() {
                var newValue = self.$('li').index(e.target);
                if (newValue === 0 && self.rated.value === 0) newValue = -1;
                
                self.rated.value = newValue;
                self.selectRatings(self.rated.value);
                self.$el.addClass('stale');

                // output
                var payload = {
                    id: self.rated.organisationId,
                    groupId: self.rated.groupId,
                    childId: self.rated.childId,
                    rateId: self.rated.id,
                    value: self.rated.value
                };

                var cmd = new ns.Command({
                    command: 'childSetRatingTo',
                    payload: payload
                });

                cmd.emit(function(evt) {
                    self.$el.removeClass('stale');
                });
            }

            this.rated.child.checkForActivation(function(hasCredits, result) {
                if (hasCredits && result) {
                    rateChild();
                } else if (result) {
                    Backbone.history.navigate('pricing/' + self.rated.child.parent.id, { trigger: true });
                } else if (hasCredits === undefined && result === undefined) {
                    rateChild();
                }
            });
        },

        hoverRatings: function(pos) {
            if (this.rated.child && this.rated.child.has('archive')) return;

            var colours = ["e49420", "ecdb00", "3bad54"];

            this.$('li').each(function(index, ele) {
                if(index <= pos) {
                    $(this).addClass('hover');
                    $(this).removeClass('selected');
                } else {
                    $(this).removeClass('hover');
                    $(this).removeClass('selected');
                }
            });
        },

        selectRatings: function(pos) {
            var colours = ["e49420", "ecdb00", "3bad54"];

            this.$('li').each(function(index, ele) {
                if(index <= pos) {
                    $(this).addClass('selected');      
                    $(this).removeClass('hover');      
                } else {
                    $(this).removeClass('selected');     
                    $(this).removeClass('hover');  
                }
            });
        },

        onRender: function() {
            var self = this;

            this.selectRatings(this.rated.value);

            this.$("li").hover(function(e) {
                self.hoverRatings(self.$('li').index(e.target));
            }, function(e) {
                self.selectRatings(self.rated.value);
            });

            return this;
        }

    });

    // Required, return the module for AMD compliance
    return RatingControl;
});