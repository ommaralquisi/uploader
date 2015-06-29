(function () {
    var creativeStore = {
        listeners: [],
        creatives: [],
        defaultClickUrl: 'http://',
        key: 0,

        addChangeListener: function (listener) {
            this.listeners.push(listener);
        },

        notifyListeners: function () {
            _.each(this.listeners, function (listener) { listener() });
        },

        setValidSizes: function (sizes) {
            this.validSizes = sizes;
        },

        addFile: function (file) {
            var reader = new FileReader();
            var image = new Image();

            reader.onload = function(upload) {
                image.src    = upload.target.result;
                image.onload = function () {

                    creativeStore.add({
                        type: 'file',
                        clickUrl: '',
                        filename: file.name,
                        filesize: file.size,
                        size: this.width + 'x' + this.height,
                        url: upload.target.result
                    });
                }
            }.bind(this);

            reader.readAsDataURL(file);
        },

        add: function (creative) {
            creative.id = this.key++;

            if (creative.type == 'file') {
                if (creative.filesize > 40 * 1024) {
                    this.setInvalid(creative, 'Creative filesize too large, max 40KB!');
                    isValid = false;
                }

                creative.filesize = this.getHumanFileSize(creative['filesize']);
            }

            this.validate(creative);

            this.creatives.push(creative);

            this.notifyListeners();
        },

        validate: function (creative) {
            if (_.indexOf(['url', 'content', 'file'], creative.type) != -1 && !this.isValidSize(creative.size)) {
                this.setInvalid(creative, 'Incorrect creative dimensions!');
            } else {
                delete creative.state;
                delete creative.reason;
            }
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

        setDefaultClickUrl: function (url) {
            this.defaultClickUrl = url;

            this.notifyListeners();
        },

        find: function (id) {
            return _.findIndex(this.creatives, function (c) { return c.id === id; });
        },

        getState: function () {
            var url = this.defaultClickUrl;

            var creatives = _.map(this.creatives, function (c) {
                if (c.type == 'file' && (!c.clickUrl || c.clickUrl == '')) {
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

        isValidSize: function (size) {
            return _.indexOf(this.validSizes, size) !== -1;
        }

    };

    /* Creatives */

    // Either an iframe or javascript creative
    var PopCreative = React.createClass({
        onChangeUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { url: e.target.value });
        },

        render: function() {
            return (
                <tr>
                    <td>
                        <img src="/img/popup.png"></img>
                    </td>
                    <td>
                        <input className="form-control" type="text" defaultValue="http://" onChange={this.onChangeUrl} />
                    </td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>
                        <button className="remove btn btn-danger" title="Remove this banner" onClick={this.props.removeCreative.bind(null, this.props.data.id)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </td>
                </tr>
            );
        }
    });


    var ContentCreative = React.createClass({
        onChangeContent: function (e) {
            this.props.updateCreative(this.props.data.id, { content: e.target.value });
        },

        onChangeSize: function (e) {
            this.props.updateCreative(this.props.data.id, { size: e.target.value });
        },

        onChangeKind: function (e) {
            this.props.updateCreative(this.props.data.id, { kind: e.target.value.toLowerCase() });
        },

        getAllowedSizes: function () {
            return _.map(this.props.allowedSizes, function (size) {
                return <option key={size} value={size}>{size}</option>;
            });
        },

        render: function() {
            return (
                <tr>
                    <td>
                        <img src={'/img/content-' + this.props.data.kind + '.png'}></img>
                        <select style={{verticalAlign: 'top'}} name="kind" onChange={this.onChangeKind}>
                            <option>HTML</option>
                            <option>Javascript</option>
                        </select>
                    </td>
                    <td>
                        <textarea className="form-control" rows="7" cols="40" onChange={this.onChangeContent}></textarea>
                        <span className="clicktrackinginfo">Use the macro <code>${'{CLICKURL}'}</code> to enable click tracking</span>
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <select name="dimensions" onChange={this.onChangeSize}>
                            <option>Choose one</option>
                            {this.getAllowedSizes()}
                        </select>
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <button className="remove btn btn-danger" title="Remove this banner" onClick={this.props.removeCreative.bind(null, this.props.data.id)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </td>
                </tr>
            );
        }
    });


    // Either an iframe or javascript creative
    var UrlCreative = React.createClass({
        onChangeUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { url: e.target.value });
        },

        onChangeSize: function (e) {
            this.props.updateCreative(this.props.data.id, { size: e.target.value });
        },

        onChangeKind: function (e) {
            this.props.updateCreative(this.props.data.id, { kind: e.target.value });
        },

        getAllowedSizes: function () {
            return _.map(this.props.allowedSizes, function (size) {
                return <option key={size} value={size}>{size}</option>;
            });
        },

        render: function() {
            return (
                <tr>
                    <td>
                        <img src={'/img/url-' + this.props.data.kind.toLowerCase() + '.png'}></img>
                        <select style={{verticalAlign: 'top'}} name="kind" onChange={this.onChangeKind}>
                            <option>iFrame</option>
                            <option>Javascript</option>
                        </select>
                    </td>
                    <td>
                        <input className="form-control" type="text" defaultValue="http://" onChange={this.onChangeUrl} />
                        <span className="clicktrackinginfo">Use the macro <code>${'{CLICKURL}'}</code> to enable click tracking</span>
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <select name="dimensions" onChange={this.onChangeSize}>
                            <option>Choose one</option>
                            {this.getAllowedSizes()}
                        </select>
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <button className="remove btn btn-danger" title="Remove this banner" onClick={this.props.removeCreative.bind(null, this.props.data.id)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </td>
                </tr>
            );
        }
    });

    var ImageCreative = React.createClass({
        onChangeClickUrl: function (e) {
            this.props.updateCreative(this.props.data.id, { clickUrl: e.target.value });
        },

        render: function() {
            if (this.props.data.state === 'invalid') {
                var creativeStyle = 'declined';
                var urlInput = this.props.data.reason;
            }
            else {
                var urlInput = <input ref="clickUrl" className="clickurl form-control default" type="text" defaultValue="http://" value={this.props.data.clickUrl} name="clickurl" onChange={this.onChangeClickUrl}/>;
            }

            return (
                <tr className={creativeStyle}>
                    <td className="preview">
                        <span className="pwrap"><img src={this.props.data.url} alt="Preview"></img></span>
                    </td>
                    <td className="filename">{ this.props.data.filename }</td>
                    <td>{ this.props.data.filesize }</td>
                    <td>{ this.props.data.size }</td>
                    <td>
                        {urlInput}
                    </td>
                    <td>
                        <button className="remove btn btn-danger" title="Remove this banner" onClick={this.props.removeCreative.bind(null, this.props.data.id)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </td>
                </tr>
            );
        }
    });

    var CreativeList = React.createClass({
        render: function() {
            var removeCreative = this.props.removeCreative;
            var updateCreative = this.props.updateCreative;

            if (this.props.creatives.length === 0) {
                return false;
            }

            allowedSizes = this.props.allowedSizes;

            var creatives = this.props.creatives.map(function (creative) {
                switch (creative.type) {
                    case 'file':
                        return <ImageCreative key={creative.id} data={creative} removeCreative={removeCreative} updateCreative={updateCreative}/>;
                    case 'url':
                        return <UrlCreative key={creative.id} data={creative} removeCreative={removeCreative} updateCreative={updateCreative} allowedSizes={allowedSizes} />;
                    case 'content':
                        return <ContentCreative key={creative.id} data={creative} removeCreative={removeCreative} updateCreative={updateCreative} allowedSizes={allowedSizes} />;
                    case 'pop':
                        return <PopCreative key={creative.id} data={creative} removeCreative={removeCreative} updateCreative={updateCreative} />;
                    default:
                        return <tr><td>Unknown Creative Type</td></tr>;
                }
            });
            return (
                <table id="creatives" className="table nosort" cellSpacing="0">
                <thead><tr><th>Preview</th><th>Filename / URL</th><th>Filesize</th><th>Dimensions</th><th>Click URL</th><th>Remove</th></tr></thead>
                <tbody>
                {creatives}
                </tbody>
                </table>
            );
        }
    });

    var DefaultUrl = React.createClass({
        update: function (e) {
            this.props.updateDefaultClickUrl(e.target.value);
        },

        render: function () {
            return (
                <div id="section-clickurl">
                    <div className="form-group">
                        <label htmlFor="clickurl">Default Click URL for all banners <span style={{fontWeight: 'normal'}}>(optional)</span></label>
                        <input id="clickurl" className="form-control" type="text" name="url" size="50" defaultValue="http://" onChange={this.update} />
                    </div>
                </div>
            );
        }
    });

    var UploadButtons = React.createClass({
        onUrlCreative: function (e) {
            this.props.addCreative({
                type: 'url',
                kind: 'iframe'
            });
        },

        onContentCreative: function (e) {
            this.props.addCreative({
                type: 'content',
                kind: 'html'
            });
        },

        onPopCreative: function (e) {
            this.props.addCreative({
                type: 'pop',
                size: '800x600'
            });

        },

        shouldShowButtonFor: function (type) {
            return _.indexOf(this.props.allowedTypes, type) != -1
        },

        render: function () {
            return (
                <p id="uploaders">
                { this.shouldShowButtonFor('file') ?
                    <a className="btn btn-primary btn-sm" href="javascript:void(0);" tabIndex="-1">
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add banner files
                        <input id="fileinput" type="file" multiple="multiple" accept="image/*,application/x-shockwave-flash" onChange={this.props.handleUpload} />
                    </a>
                : false}

                { this.shouldShowButtonFor('url') ?
                    <a className="btn btn-primary btn-sm" href="javascript:void(0);" onClick={this.onUrlCreative}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true" ></span> Add a JS or iframe URL
                    </a>
                : false}

                { this.shouldShowButtonFor('content') ?
                    <a className="btn btn-primary btn-sm" href="javascript:void(0);" onClick={this.onContentCreative}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a JS or HTML script
                    </a>
                : false}

                { this.shouldShowButtonFor('pop') ?
                    <a className="btn btn-primary btn-sm" href="javascript:void(0);" onClick={this.onPopCreative}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a popup/popunder URL
                    </a>
                : false}

                { this.shouldShowButtonFor('file') ? 'or drag them to this window' : false }

                </p>
            );
        }
    });

    var CreativeControl = React.createClass({
        getInitialState: function() {
            return creativeStore.getState();
        },

        componentDidMount: function() {
            creativeStore.addChangeListener(this._onChange);
        },

        handleUpload: function (e) {
            for (i = 0; i < e.target.files.length; i++) {
                this.addFileCreative(e.target.files[i]);
            }
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
                <div>
                    <DefaultUrl updateDefaultClickUrl={this.updateDefaultClickUrl} />
                    <UploadButtons allowedTypes={this.props.allowedTypes} handleUpload={this.handleUpload} addCreative={this.addCreative}/>
                    <CreativeList creatives={this.state.creatives} removeCreative={this.removeCreative} updateCreative={this.updateCreative} allowedSizes={this.props.allowedSizes} />
                </div>
            );
        },

        _onChange: function () {
            this.setState(creativeStore.getState());
        }
    });

    window.CreativeUploader =  function (options) {
        creativeStore.setValidSizes(options.sizes);

        var control = React.render(
            <CreativeControl allowedSizes={options.sizes} allowedTypes={options.types}/>,
            document.getElementById(options.target)
        );

        return {
            store: function () {
                return creativeStore;
            }
        }
    }
})();