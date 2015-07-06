$(function () {

    var hovered = [],
    dragTimeout,
    firstDrag = true,

    dragoverlay = $('<div id="dragoverlay"></div>').append(
        $('<h1>Drop banner files to upload</h1>'),
        $('<p>Supported file types: <span id="da-images"></span> image files, <span id="da-flash"></span> Adobe Flash files.</p>')
    ).appendTo(document.body);


    $(document).on({
        dragenter: function(e) {
            e.preventDefault();

            $.merge(hovered, [e.target]);

            if (firstDrag && e.originalEvent.dataTransfer.items) {
                dragoverlay.append($('<p>Tip: You can also drop entire directories.</p>'));
            }

            firstDrag = false;

            if (e.originalEvent.dataTransfer.types.length != 0 && ($.inArray('Files', e.originalEvent.dataTransfer.types) != -1 || $.inArray('text/plain', e.originalEvent.dataTransfer.types) != -1)) {
                clearTimeout(dragTimeout);

                dragoverlay.addClass('active');

                setTimeout(function() { dragoverlay.addClass('visible'); }, 1);
            }
        },

        dragleave: function(e) {
            hovered = $.grep(hovered, function(val) {
                return val != e.target;
            });

            if (hovered.length == 0) {
                dragoverlay.removeClass('visible');

                clearTimeout(dragTimeout);

                dragTimeout = setTimeout(function() { dragoverlay.removeClass('active'); }, 400);
            }
        },

        dragover: function(e) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy';
        },

        drop: function(e) {
            e.preventDefault();
            hovered.length = 0;
            dragoverlay.removeClass('active visible');

            if (e.originalEvent.dataTransfer.types.length != 0) {
                if ($.inArray('Files', e.originalEvent.dataTransfer.types) != -1) {
                    var items = e.originalEvent.dataTransfer.items;

                    if (items && items.length > 0 && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
                        for (var i = 0; i < items.length; i++) {
                            processEntry(items[i].getAsEntry ? items[i].getAsEntry() : items[i].webkitGetAsEntry());
                        }
                    } else {
                        processFiles(e.originalEvent.dataTransfer.files);
                    }
                } else if ($.inArray('text/plain', e.originalEvent.dataTransfer.types) != -1) {
                    addIframeOrPopRow(__allow_iframes, e.originalEvent.dataTransfer.getData('Text'));
                }
            }
        }
    });

    function processEntry(entry) {
        if (entry.isFile) {
            if (entry.name != '.DS_Store') { // Filter out MacOS ds_store files
                entry.file(function(file) {
                    processFile(file);
                });
            }
        }
        else if (entry.isDirectory) {
            var dirReader = entry.createReader();

            dirReader.readEntries(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    processEntry(entries[i]);
                }
            });
        }
    }

    function processFile(file) {
        uploader.store().addFile(file);
    }
});
