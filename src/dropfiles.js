function dropfiles(uploader) {
  var hovered = [],
      dragTimeout

  document.addEventListener("dragenter", function (e) {
    e.preventDefault();
    hovered = _.merge(hovered, [e.target]);
    if (e.dataTransfer.types.length != 0 && (_.contains('Files', e.dataTransfer.types) || _.contains('text/plain', e.dataTransfer.types))) {
      clearTimeout(dragTimeout);

      document.querySelector('#dragoverlay').className = "active";

      setTimeout(function () {
        document.querySelector('#dragoverlay').className = "active visible";
      }, 1);
    }

  }, false);

  document.addEventListener('dragleave', function (e) {
    hovered = _.remove(hovered, function (val) { // change to loaddash
      return val != e.target;
    });
    if (hovered.length == 0) {
      document.querySelector('#dragoverlay').className = '';

      clearTimeout(dragTimeout);

      dragTimeout = setTimeout(function () {
        document.querySelector('#dragoverlay').className = '';
      }, 400);
    }
  }, false);

  document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, false);

  document.addEventListener("drop", function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    hovered.length = 0;
    document.querySelector('#dragoverlay').className = '';

    if (e.dataTransfer.types.length != 0) {
      if (_.contains('Files', e.dataTransfer.types) != -1) {
        var items = e.dataTransfer.items;

        if (items && items.length > 0 && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
          for (var i = 0; i < items.length; i++) {
            processEntry(items[i].getAsEntry ? items[i].getAsEntry() : items[i].webkitGetAsEntry());
          }
        } else {
          processFiles(e.dataTransfer.files);
        }
      } else if (_.contains('text/plain', e.dataTransfer.types)) {
        addIframeOrPopRow(__allow_iframes, e.dataTransfer.getData('Text'));
      }
    }
    return false;
  }, false);

  function processEntry(entry) {
    if (entry.isFile) {
      if (entry.name != '.DS_Store') { // Filter out MacOS ds_store files
        entry.file(function (file) {
          processFile(file);
        });
      }
    }
    else if (entry.isDirectory) {
      var dirReader = entry.createReader();

      dirReader.readEntries(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          processEntry(entries[i]);
        }
      });
    }
  }

  function processFile(file) {
    uploader.store().addFile(file);
  }

};
