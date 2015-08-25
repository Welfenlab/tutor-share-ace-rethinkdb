# Share-Ace
Ace bindings for ShareJS >= 0.7.x.

Crude fork from Share-CodeMirror.

## Usage

```javascript
var aceEdit;

onload = function() {
  aceEdit = ace.edit("editor");
};

doc.whenReady(function () {
  doc.attachAce(aceEdit);
}
```

That's it. You now have 2-way sync between your ShareJS and CodeMirror.

## Install with Bower

```
bower install git://github.com/5cript/share-ace
```

## Install with NPM

```
npm install git://github.com/5cript/share-ace
```

On Node.js you can mount the `scriptsDir` (where `share-ace.js` lives) as a static resource
in your web server:

```javascript
var shareAce = require('share-ace');
// This example uses express.
app.use(express.static(shareAce.scriptsDir));
```

In the HTML:

```html
<script src="/share-ace.js"></script>
```

## Try it out

```
npm install
# currently necessary due to outdated npm package
cd node_modules/share && npm install && make && cd ../..
bower install
node examples/server.js
# in a couple of browsers...
open http://localhost:7007
```

## Run tests

Tests are currently not available. <- FIXME
