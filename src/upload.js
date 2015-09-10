(function () {
    var creativeStore = window.createCreativeStore();

    var PopCreative = React.createClass({displayName: "PopCreative",
        onChangeUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { url: e.target.value });
        },

        render: function() {
            return (
                React.createElement("tr", null, 
                    React.createElement("td", null, 
                        React.createElement("img", {src: "../img/creatives/popup.png"})
                    ), 
                    React.createElement("td", null, 
                        React.createElement("input", {className: "form-control", type: "text", defaultValue: "http://", onChange: this.onChangeUrl})
                    ), 
                    React.createElement("td", null, " "), 
                    React.createElement("td", null, " "), 
                    React.createElement("td", null,  this.props.data.showErrors && this.props.data.state == 'invalid' ? React.createElement("div", {className: "alert alert-danger"}, React.createElement("span", {className: "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}), " ", this.props.data.reason) : ''), 
                    React.createElement("td", null, 
                        React.createElement("button", {className: "remove btn btn-danger", title: "Remove this banner", onClick: this.props.removeCreative.bind(null, this.props.data.id)}, 
                            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
                        )
                    )
                )
            );
        }
    });


    var ContentCreative = React.createClass({displayName: "ContentCreative",
        onChangeContent: function (e) {
            this.props.updateCreative(this.props.data.id, { content: e.target.value });
        },

        onChangeSize: function (e) {
            this.props.updateCreative(this.props.data.id, { size: e.target.value });
        },

        onChangeType: function (e) {
            this.props.updateCreative(this.props.data.id, { type: e.target.value.toLowerCase() });
        },

        getAllowedSizes: function () {
            return _.map(this.props.allowedSizes, function (size) {
                return React.createElement("option", {key: size, value: size}, size);
            });
        },

        render: function() {
            return (
                React.createElement("tr", null, 
                    React.createElement("td", null, 
                        React.createElement("img", {src: '../img/creatives/content-html.png'}),
                    ), 
                    React.createElement("td", null, 
                        React.createElement("textarea", {className: "form-control", rows: "7", cols: "40", onChange: this.onChangeContent}), 
                        React.createElement("span", {className: "clicktrackinginfo"}, "Use the macro ", React.createElement("code", null, "$", '{CLICKURL}'), " to enable click tracking")
                    ), 
                    React.createElement("td", null, " "), 
                    React.createElement("td", null, 
                        React.createElement("select", {name: "dimensions", onChange: this.onChangeSize}, 
                            React.createElement("option", null, "Choose one"), 
                            this.getAllowedSizes()
                        )
                    ), 
                    React.createElement("td", null,  this.props.data.showErrors && this.props.data.state == 'invalid' ? React.createElement("div", {className: "alert alert-danger"}, React.createElement("span", {className: "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}), " ", this.props.data.reason) : ''), 
                    React.createElement("td", null, 
                        React.createElement("button", {className: "remove btn btn-danger", title: "Remove this banner", onClick: this.props.removeCreative.bind(null, this.props.data.id)}, 
                            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
                        )
                    )
                )
            );
        }
    });


    var UrlCreative = React.createClass({displayName: "UrlCreative",
        onChangeUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { url: e.target.value });
        },

        onChangeSize: function (e) {
            this.props.updateCreative(this.props.data.id, { size: e.target.value });
        },

        onChangeType: function (e) {
            this.props.updateCreative(this.props.data.id, { type: e.target.value });
        },

        getAllowedSizes: function () {
            return _.map(this.props.allowedSizes, function (size) {
                return React.createElement("option", {key: size, value: size}, size);
            });
        },

        render: function() {
            return (
                React.createElement("tr", null, 
                    React.createElement("td", null, 
                        React.createElement("img", {src: '../img/creatives/url-' + this.props.data.type.toLowerCase() + '.png'}), 
                        React.createElement("select", {style: {verticalAlign: 'top'}, name: "type", onChange: this.onChangeType}, 
                            React.createElement("option", {value: "html"}, "iFrame"), 
                            React.createElement("option", null, "Javascript")
                        )
                    ), 
                    React.createElement("td", null, 
                        React.createElement("input", {className: "form-control", type: "text", defaultValue: "http://", onChange: this.onChangeUrl}), 
                        React.createElement("span", {className: "clicktrackinginfo"}, "Use the macro ", React.createElement("code", null, "$", '{CLICKURL}'), " to enable click tracking")
                    ), 
                    React.createElement("td", null, " "), 
                    React.createElement("td", null, 
                        React.createElement("select", {name: "dimensions", onChange: this.onChangeSize}, 
                            React.createElement("option", null, "Choose one"), 
                            this.getAllowedSizes()
                        )
                    ), 
                    React.createElement("td", null,  this.props.data.showErrors && this.props.data.state == 'invalid' ? React.createElement("div", {className: "alert alert-danger"}, React.createElement("span", {className: "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}), " ", this.props.data.reason) : ''), 
                    React.createElement("td", null, 
                        React.createElement("button", {className: "remove btn btn-danger", title: "Remove this banner", onClick: this.props.removeCreative.bind(null, this.props.data.id)}, 
                            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
                        )
                    )
                )
            );
        }
    });

    var ImageCreative = React.createClass({displayName: "ImageCreative",
        onChangeClickUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { clickUrl: e.target.value });
        },

        _isInvalidCreative: function () {
            return this.props.data.permanentlyInvalid;
        },

        _renderInput: function () {
            if (this._isInvalidCreative()) {
                return this.props.data.reason;
            }

            if (this.props.data.state === 'invalid' && this.props.data.showErrors === true) {
                return (
                    React.createElement("div", {className: "form-group has-error has-feedback"}, 
                        React.createElement("input", {ref: "clickUrl", type: "text", className: "clickurl form-control default", "aria-describedby": "inputError", defaultValue: "http://", value: this.props.data.clickUrl, name: "clickurl", onChange: this.onChangeClickUrl}), 
                        React.createElement("span", {className: "glyphicon glyphicon-remove form-control-feedback", "aria-hidden": "true"}), 
                        React.createElement("span", {id: "inputError", className: "sr-only"}, "(error)")
                    )
                );
            }

            return (
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("input", {ref: "clickUrl", className: "clickurl form-control default", type: "text", defaultValue: "http://", value: this.props.data.clickUrl, name: "clickurl", onChange: this.onChangeClickUrl})
                )
            );
        },

        render: function() {
            if (this._isInvalidCreative()) {
                var creativeStyle = 'declined';
            }

            return (
                React.createElement("tr", {className: creativeStyle}, 
                    React.createElement("td", {className: "preview"}, 
                        React.createElement("span", {className: "pwrap"}, React.createElement("img", {src: this.props.data.url, alt: "Preview"}))
                    ), 
                    React.createElement("td", {className: "filename"},  this.props.data.filename), 
                    React.createElement("td", null,  this.props.data.filesize), 
                    React.createElement("td", null,  this.props.data.size), 
                    React.createElement("td", null, 
                        this._renderInput()
                    ), 
                    React.createElement("td", null, 
                        React.createElement("button", {className: "remove btn btn-danger", title: "Remove this banner", onClick: this.props.removeCreative.bind(null, this.props.data.id)}, 
                            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
                        )
                    )
                )
            );
        }
    });

    var CreativeList = React.createClass({displayName: "CreativeList",
        render: function() {
            var removeCreative = this.props.removeCreative;
            var updateCreative = this.props.updateCreative;

            if (this.props.creatives.length === 0) {
                return false;
            }

            allowedSizes = this.props.allowedSizes;

            var creatives = this.props.creatives.map(function (creative) {
                switch (creative.content_type) {
                    case 'file':
                        return React.createElement(ImageCreative, {key: creative.id, data: creative, removeCreative: removeCreative, updateCreative: updateCreative});
                    case 'url':
                        return React.createElement(UrlCreative, {key: creative.id, data: creative, removeCreative: removeCreative, updateCreative: updateCreative, allowedSizes: allowedSizes});
                    case 'content':
                        return React.createElement(ContentCreative, {key: creative.id, data: creative, removeCreative: removeCreative, updateCreative: updateCreative, allowedSizes: allowedSizes});
                    case 'popup':
                        return React.createElement(PopCreative, {key: creative.id, data: creative, removeCreative: removeCreative, updateCreative: updateCreative});
                    default:
                        return React.createElement("tr", null, React.createElement("td", null, "Unknown Creative Type"));
                }
            });
            return (
                React.createElement("div", {className: "well"}, 
                    React.createElement("table", {id: "creatives", className: "table nosort", cellSpacing: "0"}, 
                    React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Preview"), React.createElement("th", null, "Filename / URL"), React.createElement("th", null, "Filesize"), React.createElement("th", null, "Dimensions"), React.createElement("th", null, "Click URL"), React.createElement("th", null, "Remove"))), 
                    React.createElement("tbody", null, 
                    creatives
                    )
                    )
                )
            );
        }
    });

    var DefaultUrl = React.createClass({displayName: "DefaultUrl",
        update: function (e) {
            this.props.updateDefaultClickUrl(e.target.value);
        },

        render: function () {
            return (
                React.createElement("div", {id: "section-clickurl"}, 
                    React.createElement("div", {className: "form-group"}, 
                        React.createElement("label", {htmlFor: "clickurl"}, "Default Click URL for all banners ", React.createElement("span", {style: {fontWeight: 'normal'}}, "(optional)")), 
                        React.createElement("input", {id: "clickurl", className: "form-control", type: "text", name: "url", size: "50", defaultValue: "http://", onChange: this.update})
                    )
                )
            );
        }
    });

    var UploadButtons = React.createClass({displayName: "UploadButtons",
        onUrlCreative: function (e) {
            this.props.addCreative({
                content_type: 'url',
                type: 'html'
            });
        },

        onContentCreative: function (e) {
            this.props.addCreative({
                content_type: 'content',
                type: 'html'
            });
        },

        onPopCreative: function (e) {
            this.props.addCreative({
                content_type: 'popup',
                type: 'html',
                size: '800x600'
            });

        },

        shouldShowButtonFor: function (type) {
            return _.indexOf(this.props.allowedTypes, type) != -1
        },

        render: function () {
            return (
                React.createElement("p", {id: "uploaders"}, 
                 this.shouldShowButtonFor('file') ?
                    React.createElement("a", {className: "btn btn-primary btn-sm", href: "javascript:void(0);", tabIndex: "-1"}, 
                        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), " Add banner files", 
                        React.createElement("input", {id: "fileinput", name: "file[]", type: "file", multiple: "multiple", accept: "image/*,application/x-shockwave-flash", onChange: this.props.handleUpload})
                    )
                : false, 

                this.shouldShowButtonFor('content') ?
                    React.createElement("a", {className: "btn btn-primary btn-sm", href: "javascript:void(0);", onClick: this.onContentCreative}, 
                        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), "  Add a HTML tag"
                    )
                : false, 

                this.shouldShowButtonFor('url') ?
                    React.createElement("a", {className: "btn btn-primary btn-sm", href: "javascript:void(0);", onClick: this.onUrlCreative}, 
                        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), " Add a JS or iframe URL"
                    )
                : false, 

                 this.shouldShowButtonFor('popup') ?
                    React.createElement("a", {className: "btn btn-primary btn-sm", href: "javascript:void(0);", onClick: this.onPopCreative}, 
                        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), " Add a popup/popunder URL"
                    )
                : false, 

                 this.shouldShowButtonFor('file') ? 'or drag them to this window' : false

                )
            );
        }
    });

    var CreativeControl = React.createClass({displayName: "CreativeControl",
        getInitialState: function() {
            return creativeStore.getState();
        },

        componentDidMount: function() {
            creativeStore.addChangeListener(this._onChange);
        },

        handleUpload: function (e) {
            creativeStore.handleUpload(e.target);
        },

        addFileCreative: function (file) {
            creativeStore.addFile(file);
        },

        addCreative: function (options) {
            creativeStore.add(options);
        },

        updateDefaultClickUrl: function (url) {
            creativeStore.setDefaultClickUrl(url);
        },

        updateCreative: function (id, values) {
            creativeStore.update(id, values);
        },

        removeCreative: function (id) {
            creativeStore.remove(id);
        },

        render: function () {
            return (
                React.createElement("div", null, 
                    React.createElement(DefaultUrl, {updateDefaultClickUrl: this.updateDefaultClickUrl}), 
                    React.createElement(UploadButtons, {allowedTypes: this.props.allowedTypes, handleUpload: this.handleUpload, addCreative: this.addCreative}), 
                    React.createElement(CreativeList, {creatives: this.state.creatives, removeCreative: this.removeCreative, updateCreative: this.updateCreative, allowedSizes: this.props.allowedSizes})
                )
            );
        },

        _onChange: function () {
            this.setState(creativeStore.getState());
        }
    });

    window.CreativeUploader =  function (options) {
        creativeStore.setValidSizes(options.sizes);
        creativeStore.setCreativesEndpoint(options.url);

        if (options.onNewCreatives) {
            creativeStore.addNewCreativesListener(options.onNewCreatives);
        }

        var control = React.render(
            React.createElement(CreativeControl, {allowedSizes: options.sizes, allowedTypes: options.types}),
            document.getElementById(options.target)
        );

        return {
            store: function () {
                return creativeStore;
            }
        }
    };
})();
