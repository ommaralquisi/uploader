(function () {
    window.createCreativeStore = function () {
        return {
            listeners: [],
            creatives: [],
            defaultClickUrl: 'http://',
            key: 0,
            showingInvalid: false,

            addChangeListener: function (listener) {
                this.listeners.push(listener);
            },

            notifyListeners: function () {
                _.each(this.listeners, function (listener) { listener(); });
            },

            setValidSizes: function (sizes) {
                this.validSizes = sizes;
            },

            setDefaultClickUrl: function (url) {
                var self = this;
                this.defaultClickUrl = url;

                // Revalidate all creatives that use the default clickUrl
                _.each(this.creatives ,function (creative) {
                    if (!creative.clickUrl || creative.clickUrl === '') {
                        self.validate(creative);
                    }
                });

                this.notifyListeners();
            },

            empty: function () {
                this.creatives = [];
                this.notifyListeners();
            },

            handleUpload: function (input) {
                if (!!window.FileReader && !!window.FormData) {
                    for (i = 0; i < input.files.length; i++) {
                        this.addFile(input.files[i]);
                    }
                }
                else {
                    this.uploadUsingIframe(input);
                }
            },

            addFile: function (file) {
                var reader = new FileReader();
                var image = new Image();
                var self = this;

                if (file.size > 120 * 1024) {
                    this.add({
                        type: 'file',
                        clickUrl: '',
                        filename: file.name,
                        filesize: file.size,
                        size: 'Unknown',
                        url: self.getPlaceholder()
                    });

                    return;
                }

                reader.onload = function(upload) {
                    image.src    = upload.target.result;
                    image.onload = function () {
                        self.add({
                            type: 'file',
                            clickUrl: '',
                            filename: file.name,
                            filesize: file.size,
                            size: this.width + 'x' + this.height,
                            url: upload.target.result
                        });
                    };
                }.bind(this);

                reader.readAsDataURL(file);
            },

            uploadUsingIframe: function(fileInput) {
                var random = _.random(10000000, 999999999);
                var self = this;

                fileInput = $(fileInput);

                var newInput = fileInput.clone();

                fileInput.replaceWith(newInput);

                var form = $('<form></form>', {
                    'class': 'transport',
                    // TODO: Use the actual local base64 encoder
                    action: '/base64.php',
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    encoding: 'multipart/form-data',
                    target: 'uploadiframe' + random
                }).append(fileInput).appendTo($(document.body));

                var ifm = $('<iframe name="uploadiframe' + random + '"></iframe>').appendTo(form).load(function() {
                    var res;

                    try {
                        res = $.parseJSON(this.contentWindow.response);
                    } catch(e) {
                        res = { error: 'Unknown error.' };
                    }

                    if (res !== null && !res.error) {

                        for (var i = 0; i < res.files.length; i++) {
                            file = res.files[i];

                            if (file.state === 'invalid') {
                                errFile = {
                                    type: 'file',
                                    clickUrl: '',
                                    filename: file.name,
                                    filesize: file.filesize,
                                    size: 'Unknown',
                                    url: self.getPlaceholder()
                                };
                                self.setInvalid(errFile);

                                self.add(errFile);
                            }
                            else {
                                self.add({
                                    type: 'file',
                                    clickUrl: '',
                                    filename: file.name,
                                    filesize: file.filesize,
                                    size: file.size,
                                    url: file.data
                                });
                            }

                        }
                    }

                    form.remove();
                });

                form.submit();
            },

            add: function (creative) {
                creative.id = this.key++;

                this.validate(creative);

                if (creative.type == 'file') {
                    if (!this.isValidSize(creative.size)) {
                        creative.permanentlyInvalid = true;
                    }

                    if (creative.filesize > 40 * 1024) {
                        this.setInvalid(creative, 'Creative filesize too large, max 40KB!');
                    }

                    creative.filesize = this.getHumanFileSize(creative.filesize);
                }

                this.creatives.push(creative);

                this.notifyListeners();
            },

            update: function (id, creative) {
                var index = this.find(id);
                var source = this.creatives[index];

                _.extend(source, creative);

                this.validate(source);

                this.notifyListeners();
            },

            remove: function (id) {
                var index = this.find(id);

                if (index !== -1) {
                    this.creatives.splice(index, 1);
                }

                this.notifyListeners();
            },

            find: function (id) {
                return _.findIndex(this.creatives, function (c) { return c.id === id; });
            },

            validate: function (creative) {
                if (creative.type !== 'pop' && !this.isValidSize(creative.size)) {
                    this.setInvalid(creative, 'Incorrect creative dimensions!');
                    return;
                }

                if (creative.type !== 'file' && !this.isValidUrl(creative.url)) {
                    this.setInvalid(creative, 'Incorrect URL set!');
                    return;
                }

                if (creative.type == 'file') {
                    var url = (!creative.clickUrl || creative.clickUrl === '') ? this.defaultClickUrl : creative.clickUrl;

                    if (!this.isValidUrl(url)) {
                        this.setInvalid(creative, 'Incorrect URL set!');
                        return;
                    }
                }

                delete creative.state;
                delete creative.reason;
            },

            isValidUrl: function (url) {
                return /https?:\/\/.+/.test(url);
            },

            isValidSize: function (size) {
                return _.indexOf(this.validSizes, size) !== -1;
            },

            hasOnlyValidCreatives: function () {
                // permanentlyInvalid are ignored
                return _.every(this.creatives, function (creative) {
                    return (creative.permanentlyInvalid || creative.state !== 'invalid');
                });
            },

            // Used before submitting but still contains invalid creatives
            showInvalidCreatives: function (creative) {
                this.showingInvalid = true;

                this.notifyListeners();
            },

            removeInvalidImageCreatives: function () {
                this.creatives = _.filter(this.creatives, function (creative) {
                    return !creative.permanentlyInvalid;
                });

                this.notifyListeners();
            },

            getValidCreatives: function () {
                var creatives = this.getState().creatives;

                return _.filter(creatives, function (creative) {
                    return creative.state != 'invalid';
                });
            },

            getState: function () {
                var url = this.defaultClickUrl;
                var self = this;

                var creatives = _.map(this.creatives, function (c) {
                    c.showErrors = self.showingInvalid;

                    if (c.type == 'file' && (!c.clickUrl || c.clickUrl === '')) {
                        var newc = _.clone(c);
                        newc.clickUrl = url;

                        return newc;
                    }

                    return c;
                });

                return { creatives: creatives };
            },

            setInvalid: function (creative, reason) {
                creative.state  = 'invalid';
                creative.reason = reason;
            },

            getHumanFileSize: function (fileSizeInBytes) {
                var i = -1;
                var byteUnits = [' KB', ' MB', ' GB'];
                do {
                    fileSizeInBytes = fileSizeInBytes / 1024;
                    i++;
                } while (fileSizeInBytes > 1024);

                return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
            },

            getPlaceholder: function () {
                return '/img/creatives/placeholder.png';
            },

            uploadCreatives: function () {
                this.removeInvalidImageCreatives();

                if (!this.hasOnlyValidCreatives()) {
                    this.showInvalidCreatives();
                } else {
                    // Transform the creatives for our API
                    $.ajax({
                        type: 'POST',
                        data: this.creatives,
                        success: uploadSuccess,
                        failed: function () {
                            alert('Error: We could not upload the creatives! Please contact support.');
                        }
                    })
                }
            }
        };
    };
})();
