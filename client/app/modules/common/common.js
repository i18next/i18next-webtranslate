define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app
      , persistedMembers = ['username', 'id'];

    // Create a new module
    var module = ns.module({ name: 'common', append: true, utils: {} });

    var cookie = module.utils.cookie = {
    
        create: function(name,value,minutes) {
            var expires;
            if (minutes) {
                    var date = new Date();
                    date.setTime(date.getTime()+(minutes*60*1000));
                    expires = "; expires="+date.toGMTString();
            }
            else expires = "";
            document.cookie = name+"="+value+expires+"; path=/";
        },
        
        read: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },
        
        remove: function(name) {
            this.create(name,"",-1);
        }
    };

    var isMobile;
    var detectMobile = module.utils.detectMobile = function() {
        if (isMobile === undefined) {
            isMobile = (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent);
        }
        return isMobile;
    };

    var tooltip = module.utils.tooltip = function(view, selector) {
        if (!detectMobile()) {
            var sel2 = selector + ' i[rel=tooltip]';
            view.$(selector).tooltip({selector: 'i[rel=tooltip]'});
            view.$(sel2).on('click', function(e) {
                $(this).tooltip('hide');
            });
        }
    };

    // Required, return the module for AMD compliance
    return module;
});