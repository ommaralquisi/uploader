Create a new creative uploader as such:

```javascript
var uploader = CreativeUploader({
    types: ['file', 'url', 'content', 'pop'],
    sizes: ['120x600', '160x600', '300x250', '468x60', '728x90'],
    target: 'content',
    onNewCreatives: function (creatives) {
        console.log(creatives);
    }
});
```

Get the store with `uploader.store()`. Each creative is in the following format:

```javascript
{
    content_type: ['url', 'content', 'file', 'pop'],
    type: ['html','js'], // Only with content and url
    clickUrl: '',
    filename: 'myfile.png',
    filesize: '342343',
    size: '300x250',
    url: '',

    // Errors, set if the creative is invalid.
    state: 'invalid',
    permanentlyInvalid: true, // Invalid images are always invalid, except for clickUrl
    reason: 'Invalid size',
    showErrors: true,  // Show errors for all creatives
}
```
