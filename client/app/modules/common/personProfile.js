define([
    'backbone',
    'underscore',
    'namespace',
    'jquery_ui_addresspicker',
    './canvasBox'
],

function(Backbone, _, ns, picker, box) {
	var app = ns.app;

    var PersonProfile  = ns.ItemView.extend({

        tagName: 'div',
        template: 'personProfile',

        setModel: function(model, editable) {
            if (model.id !== app.user.id) {
                this.isNotMe = true;
            }
            this.model = model;

            this.isMember = false;
            this.isChild = false;
            this.isOrganisation = false;
            this.isGroup = false;

            if (this.model.has('username')) {
                this.isMember = true;
            } else if (this.model.has('name') && this.model.parent) {
                this.isGroup = true;
            } else if (this.model.has('name') && !this.model.parent) {
                this.isOrganisation = true;
            } else {
                this.isChild = true;
            }

            this.editable = editable;
            if (this.editable) this.readOnly = true;
            this.render();

            return this;
        },

        setCallbacks: function(save, cancel, avatarUploaded) {
            this.save = save;
            this.cancel = cancel;
            this.avatarUploaded = avatarUploaded;
        },

        initialize: function(){
            $.validator.addMethod(
                "swissDate",
                function(value, element) {

                    if (value && value !== '') {
                        // put your own logic here, this is just a (crappy) example
                        if (!value.match(/^\d\d?\.\d\d?\.\d\d\d\d$/)) {
                            return false;
                        }

                        var parts = value.split('.');
                        if (parseInt(parts[0], 10) > 31 || parseInt(parts[1], 10) > 12) {
                            return false;
                        }
                    }

                    return true;
                },
                'Bitte geben Sie ein Datum im Format "dd.mm.yyyy" an.'
            );
        },

        events: {
            'click .saveProfile': 'ui_save',
            'click .cancelProfile': 'ui_cancel',
            'click .avatarContainer': 'ui_showAvatarUpload',
            'click .edit': 'ui_edit'
        },

        ui_edit: function(e) {
            if (e) e.preventDefault();

            this.readOnly = !this.readOnly || false;
            this.render();

            if (this.readOnly !== true) {
                this.initAddressPicker();
                this.initDropZone();
            }
        },

        ui_showAvatarUpload: function(e) {
            e.preventDefault();

            if (this.readOnly) {
                return;
            }
            this.$('.upload-widget').toggle();
        },

        ui_save: function(e) {
            e.preventDefault();

            var valid = this.$('.profile').valid();

            if (valid) {

                var data = {
                    name: this.isOrganisation ? (this.$('#organisationName').val() || undefined) : this.isGroup ? (this.$('#groupName').val() || undefined) : undefined,
                    ratingTemplate: { id: this.$('#ratingTemplate').val(), title: this.$('#ratingTemplate option:selected').text() },
                    description: this.$('#description').val() || undefined,
                    givenName: this.$('#givenName').val() || undefined,
                    familyName: this.$('#familyName').val() || undefined,
                    birthday: this.$('#birthday').val() ? moment(this.$('#birthday').val(), "DD.MM.YYYY").toDate() : undefined,

                    address: {
                        street1: this.$('#street1').val() || undefined,
                        street2: this.$('#street2').val() || undefined,
                        postalcode: this.$('#postalcode').val() || undefined,
                        city: this.$('#city').val() || undefined
                    },

                    contact: {
                        name: this.$('#contactname').val() || undefined,
                        email: this.$('#email').val() || undefined,
                        phoneMobile: this.$('#phone-mobile').val() || undefined,
                        phoneHome: this.$('#phone-home').val() || undefined,
                        phoneWork: this.$('#phone-work').val() || undefined
                    }
                };

                // how to assert that this is still valid?
                if (this.searchResult) {
                    data.address.lat = this.searchResult.lat;
                    data.address.lng = this.searchResult.lng;
                } else {
                    if (this.model.has('address')) {
                        data.address.lat = this.model.get('address').lat;
                        data.address.lng = this.model.get('address').lng;
                    }
                }

                if (this.save) {
                    this.save(data, this.model);
                }

            }
        },

        ui_cancel: function(e) {
            e.preventDefault();

            if (this.cancel) {
                this.cancel();
            } else {
                this.render(); // clear form
            }
        },

        onRender: function() {

            if (this.model.has('avatarUrl')) {
                this.$('.avatar').attr('src', this.model.get('avatarUrl'));
            }
            
            if (this.model.has('birthday') && this.model.get('birthday') !== '') {
                this.$('#birthday').val(moment(this.model.get('birthday')).format('DD.MM.YYYY'));
            }

            if(this.isMember) {
                this.$('#group-contactname').remove();
            }

            if (this.isGroup) {
                this.$('.groupData').show();
                this.$('.personData').remove();
                this.$('.addressFieldset').remove();
                this.$('.contactFieldset').remove();
            } else if (this.isOrganisation) {
                this.$('.organisationData').show();
                this.$('.personData').remove();
                this.$('#group-phone-work').remove();
                this.$('#group-contactname').remove();
            }

            var inputs; 

            if (this.readOnly === true) {
                inputs = this.$('input, button');
                inputs.addClass('readOnly');
                inputs.attr('disabled', 'disabled');
                this.$('.searchAddress').hide();
                this.$('#map').hide();
                this.$('.address').css('margin-top', '18px');
                this.$('.address').css('-webkit-margin-top-collapse', 'separate');
                this.$('.avatar').css('cursor', 'default');
                this.$('.avatarDescription').hide();
            } else {
                inputs = this.$('input');
                inputs.removeClass('readOnly');
                inputs.removeAttr('disabled');
                this.$('.searchAddress').show();
                this.$('#map').show();
                this.$('.address').css('margin-top', 0);
                this.$('.address').css('-webkit-margin-top-collapse', '');
                this.$('.avatar').css('cursor', 'pointer');
                this.$('.avatarDescription').show();
            }

            if (!this.editable) this.$('.commands').hide();

            this.$('.profile').validate({
                rules: {
                    email: {
                        required: this.isMember || this.isOrganisation,
                        email: true
                    },
                    organisationName: {
                        minlength: 1,
                        required: this.isOrganisation
                    },
                    groupName: {
                        minlength: 1,
                        required: this.isGroup
                    },
                    birthday: {
                        swissDate: true,
                        required: false
                    }
                },
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error');
                    $(label).closest('.control-group').removeClass('success');
                },
                unhighlight: function(label) {
                    $(label).closest('.control-group').removeClass('error');
                },
                success: function(label) {
                    label.closest('.control-group').addClass('success');
                    label.remove();
                }
            });

            // deactivate img upload
            if ((!window.WebKitBlobBuilder && !window.MozBlobBuilder && !window.BlobBuilder) ||
                !window.FileReader) {
                this.$('.notSupported').show();
                this.$('.avatarDescription').hide();
                this.$el.undelegate('.avatar', 'click');
            }

            if (this.isMember && this.isNotMe) {
                this.$('.commands').hide();
                this.$('.form-actions').hide();
            }

            ns.modules.common.utils.tooltip(this, '.commands');
        },

        onShow: function() {
            if (this.readOnly !== true) {
                this.initAddressPicker();
                this.initDropZone();
            }

            if (this.isOrganisation) {
                var orgRatingTemplate = this.model.get('ratingTemplate');
                var orgHasRatingTemplateSet = true;

                if (!orgRatingTemplate || !orgRatingTemplate.id) {
                    orgHasRatingTemplateSet = false;
                    this.$('.saveProfile').attr('disabled', true);
                }

                // templates
                if (!this.initChosen) {
                    var templates = app.store.get('templates');
                    if (templates) {
                        for (var i = 0, len = templates.models.length; i < len; i++) {
                            var opt = templates.models[i];
                            if (orgHasRatingTemplateSet && opt.id === orgRatingTemplate.id) {
                                continue;
                            } else {
                                var item = '<option value="' + opt.id + '">' + opt.get('title') + '</option> ';
                                this.$('#ratingTemplate').append($(item));
                            }
                        }
                        var self = this;
                        this.$('#ratingTemplate').chosen().change(function() {
                            self.$('.saveProfile').removeAttr('disabled');
                        });
                        this.initChosen = true;
                    }
                }
            }
        },

        initDropZone: function() {
            var self = this;

            var dropzone = this.$('#droparea')
              , uploadBtn = this.$('#uploadbtn')
              , defaultUploadBtn = this.$('#upload')
              , saveBtn = this.$('#takeSnapshot');

            var current;

            // events
            dropzone.on('dragover', function() {
                //add hover class when drag over
                dropzone.addClass('hover');
                return false;
            });
            dropzone.on('dragleave', function() {
                //remove hover class when drag out
                dropzone.removeClass('hover');
                return false;
            });
            dropzone.on('drop', function(e) {
                //prevent browser from open the file when drop off
                e.stopPropagation();
                e.preventDefault();
                dropzone.removeClass('hover');
                
                //retrieve uploaded files data
                var files = e.originalEvent.dataTransfer.files;
                processFiles(files);

                return false;
            });
                
            uploadBtn.on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                //trigger default file upload button
                defaultUploadBtn.click();
            });
            defaultUploadBtn.on('change', function() {
                //retrieve selected uploaded files data
                var files = $(this)[0].files;
                processFiles(files);
                
                return false;
            });

            saveBtn.on('click', function(e) {
                e.preventDefault();

                newimageurl = getCanvasImage(current, box.boxes[0]);
                
                // uploadToServer(current.orig, dataURItoBlob(newimageurl));
                var uplSuccess = self.avatarUploaded || function(url) {
                    var model = self.model;

                    // send command
                    var cmd = new ns.Command({
                        command: 'changeAvatarUrlForChildInOrganisation',
                        payload: {
                            id: model.parent.id,
                            childId: model.id,
                            avatarUrl: url
                        }
                    });

                    cmd.emit(function(evt) {
                        self.$('.avatar').attr('src', url);
                        self.$('.upload-widget').toggle();
                    });
                };

                uplSuccess(newimageurl, self);
            });

            // functions
            var processFiles = function(files) {
                if(files && typeof FileReader !== "undefined") {
                    //process each files only if browser is supported
                    for(var i=0; i<files.length; i++) {
                        readFile(files[i]);
                    }
                } else {
                    
                }
            };

            var readFile = function(file) {
                if( (/image/i).test(file.type) ) {
                    //define FileReader object
                    var reader = new FileReader();
                    
                    //init reader onload event handlers
                    reader.onload = function(e) {   
                        var image = $('<img/>')
                        .load(function() {
                            //when image fully loaded
                            var scale = drawImageOnCanvas(this);
                            current = {
                                scale: scale,
                                image: this,
                                orig: file
                            };
                            //createPreview(file, newimageurl);
                            //uploadToServer(file, dataURItoBlob(newimageurl));
                            
                        })
                        .attr('src', e.target.result);  
                    };
                    
                    //begin reader read operation
                    reader.readAsDataURL(file);
                    
                    this.$('#err').text('');
                } else {
                    //some message for wrong file format
                    this.$('#err').text('*Selected file format not supported!');
                }
            };

            var drawImageOnCanvas = function(image) {
                
                var canvas = self.$('#preview')
                  , origEle = canvas[0];

                canvas.attr('height', canvas.height()).attr('width', canvas.width());

                // clear content hack!!!
                origEle.width--;
                origEle.width++;

                // scale ratio
                var ratioW = origEle.width / image.width
                  , ratioH = origEle.height / image.height;

                scale = (ratioW <= ratioH) ? ratioW : ratioH;

                var ctx = origEle.getContext('2d');
                ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

                var overlay = self.$('#overlayCanvas');
                overlay.attr('height', image.height * scale).attr('width', image.width * scale);

                box.init(overlay.get(0), { keepSquare: true });

                return scale;
            };

            var getCanvasImage = function(current, rect) {
          
                var sx = rect.x / current.scale
                  , sy = rect.y / current.scale
                  , sw = rect.w / current.scale
                  , sh = rect.h / current.scale;

                //define canvas
                var canvas = document.createElement('canvas');
                canvas.width = 250;
                canvas.height = 250;
                var ctx = canvas.getContext('2d');
                
                //draw canvas image 
                ctx.drawImage(current.image, sx, sy, sw, sh, 0, 0, 250, 250);
                
                //convert canvas to jpeg url
                return canvas.toDataURL("image/jpeg");
            };

            function dataURItoBlob(dataURI) {
                var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;
            
                //skip if browser doesn't support BlobBuilder object
                if(typeof BlobBuilder === "undefined") {
                    $('#err').html('Ops! There have some limited with your browser! <br/>New image produced from canvas can\'t be upload to the server...');
                    return dataURI;
                }
                
                // convert base64 to raw binary data held in a string
                // doesn't handle URLEncoded DataURIs
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(dataURI.split(',')[1]);
                else
                    byteString = unescape(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to an ArrayBuffer
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                // write the ArrayBuffer to a blob, and you're done
                var bb = new BlobBuilder();
                bb.append(ab);
                return bb.getBlob(mimeString);
            }

            var uploadToServer = function(oldFile, newFile) {
                // prepare FormData
                var formData = new FormData();  
                //we still have to use back old file
                //since new file doesn't contains original file data
                var newFilename = self.model.id + oldFile.name.substring(oldFile.name.lastIndexOf('.'), oldFile.name.length);
                formData.append('filename', newFilename);
                formData.append('filetype', oldFile.type);
                formData.append('file', newFile);

                var uplSuccess = self.avatarUploaded || function(url) {
                    if (url !== 'NOK') {
                        var model = self.model;

                        // send command
                        var cmd = new ns.Command({
                            command: 'changeAvatarUrlForChildInOrganisation',
                            payload: {
                                id: model.parent.id,
                                childId: model.id,
                                avatarUrl: url
                            }
                        });

                        cmd.emit(function(evt) {
                            self.$('.avatar').attr('src', url);
                            self.$('.upload-widget').toggle();
                        });
                    }
                };
                            
                //submit formData using $.ajax          
                $.ajax({
                    url: '/uploadAvatar',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(url) { uplSuccess(url, self); }
                }); 
            };
        },

        initAddressPicker: function() {
            var self = this;

            if (!window.google || !window.google.maps || !window.google.maps.MapTypeId || !window.google.maps.MapTypeId.ROADMAP) {
                this.$('.searchAddress').hide();
                this.$('#map').hide();
                this.$('.address').css('margin-top', '18px');
                this.$('.address').css('-webkit-margin-top-collapse', 'separate');
                return;
            }

            var options = {
                regionBias: "ch",
                locate: false, // turn on to use geolocate functionality of browser
                elements: {
                     map:      "#map"
                //     //lat:      "#lat",
                //     //lng:      "#lng",
                //     //locality: '#city',
                //     //country:  '#country',
                //     //administrativeAreaLevel1: '#administrative_area_level_1',
                //     //administrativeAreaLevel2: '#administrative_area_level_2',
                //     //postalCode: '#postalcode',
                //     //streetNumber: '#street_number',
                //     //route: '#street1'//,
                //     //type:    '#type' 
                },
                onSelect: function(data) {
                    self.$('#street1').val(data.route + ' ' + data.streetNumber);
                    self.$('#street2').val('');
                    self.$('#postalcode').val(data.postalCode);
                    self.$('#city').val(data.locality);
                    self.searchResult = data;
                }
            };

            var address = this.model.get('address');

            if (address && address.lat) {
                options.mapOptions = {
                    zoom: 15, 
                    center: new google.maps.LatLng(address.lat, address.lng), 
                    scrollwheel: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
            }

            var addresspickerMap = this.$( "#searchAddress" ).addresspicker(options);
        }

    });

    // Required, return the module for AMD compliance
    return PersonProfile;
});
