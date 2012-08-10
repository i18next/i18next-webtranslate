define([
    // Libs
    "jquery",
    "underscore",
    "handlebars"
],

function($, _, Handlebars) {
  // Put application wide code here

    //var tmp = 0;

    return {
        // This is useful when developing if you don't want to use a
        // build process every time you change a template.
        //
        // Delete if you are using a different template loading method.
        fetchTemplate: function(path, done) {
            var JST = window.JST = window.JST || {};
            var def = new $.Deferred();

            // Should be an instant synchronous way of getting the template, if it
            // exists in the JST object.
            if (JST[path]) {
                var tmpl = Handlebars.template(JST[path]);
                if (_.isFunction(done)) {
                    done(tmpl);
                }

                return def.resolve(tmpl);
            }
            else {
                path = 'app/templates/' + path + '.html';
            }

            // Fetch it asynchronously if not available from JST, ensure that
            // template requests are never cached and prevent global ajax event
            // handlers from firing.
            $.ajax({
                url: path,
                type: "get",
                dataType: "text",
                cache: false,
                global: false,

                success: function(contents) {
                    JST[path] = contents;

                    // Set the global JST cache and return the template
                    if (_.isFunction(done)) {
                        done(JST[path]);
                    }

                    // Resolve the template deferred
                    def.resolve(JST[path]);
                }
          });

          // Ensure a normalized return value (Promise)
          return def.promise();
        }
    };
});