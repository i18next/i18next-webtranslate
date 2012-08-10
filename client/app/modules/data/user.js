define([
    'jquery',
    'backbone',
    'namespace',
    '../common/common'
],

function($, Backbone, ns, common) {
	var app = ns.app
      , cookie = common.utils.cookie
      , persistedMembers = ['username', 'id', 'fullname'];

    // Create a new module
    var module = ns.module({ name: 'auth', append: false });

    module.Models.User = ns.Model.extend({
        modelName: 'user',
        useCQRS: false, // don't autobind

        url: function(){
            return '/data/user/';
        },
        
        getDisplayName: function() {
            var u = this.get('fullname') || this.get('username');
            
            return u ? u : ' ';
        },
        
        parse: function(res) {
            return res.response;
        },

        isAuth: function(role) {
            if (role === 'sysadmin') {
                return this.get('isSysAdmin');
            } else {
                return this.has('username');
            }
        },

        auth: function() {
            Backbone.history.navigate('login', { trigger: true });
        },

        deAuth: function() {
            var rootUrl = window.location.protocol + '//' + window.location.host;
            location.replace(rootUrl + '/logout'); 
        },
        
        // `user.load()`    
        // gets the user from cookie and fetches person data if already authorized
        load: function(callback) {      
            // var val = cookie.read('currentUser');
            // if (val && val !== 'undefined') val = JSON.parse(val);
            
            // if (val && val !== 'undefined') {
            //     this.set(val);
            // }
            
            // load person data
            var self = this;
            this.fetch({success: function() {
                self.save();
                app.vent.trigger('userChanged', self);
                if (callback) callback(null, self);
            }});
            return this;
        },

        destroy: function() {
            this.clear();
            //cookie.remove('currentUser');
            app.vent.trigger('userChanged', self);
            return this;
        },
        
        // `user.save()`    
        // persist needed members to cookie
        save: function() {
            var persist = {}
              , user = this.toJSON();
              
            for (var i = 0, len = persistedMembers.length; i < len; i++) {
                var m = persistedMembers[i];
                if (user[m]) { 
                    persist[m] = user[m];
                }
            }
            if (this.isAuth()) {
                if (this.bindCQRS) this.bindCQRS(); 
                //cookie.create('currentUser', JSON.stringify(persist), 10);
            }
            return this;
        }
    });

    // Required, return the module for AMD compliance
    return module;
});