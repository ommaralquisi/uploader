Create a new creative uploader as such:

```javascript
var uploader = CreativeUploader({
    types: ['file', 'url', 'content', 'pop'],
    sizes: ['120x600', '160x600', '300x250', '468x60', '728x90'],
    target: 'content'
});
```

Get the store with `uploader.store()`. Each creative is in the following format:

```javascript
{
    type: ['url', 'content', 'file', 'pop'],
    kind: ['html','js'], // Only with content and file
    clickUrl: '',
    filename: 'myfile.png',
    filesize: '342343',
    size: '300x250',
    url: '',

    // Errors, set if the creative is invalid.
    state: 'invalid'
    reason: 'Invalid size'
}
```
