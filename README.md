# gribbl
a webification technologies

## What is this thing?

This is only just barely starting to be a thing.  But the goal is
for it to be a command-line tool that compiles a plain `.html` file
(or a `.jade` template) into a single self-contained `.html` file.

* Scripts, CSS stylesheets, and SVG images can be inlined into their
  respective tags.  [Not yet implemented.]
* Resources used by scripts (such as `require()`d modules) can be inlined
  via Browserify.  [Maybe works now?]
* Raster images, fonts, and other hyperlinked resources can be inlined via
  `data:` URIs.  [Partially implemented.]

This project's ridiculous name comes from [a Bob the Angry Flower
comic strip](http://www.angryflower.com/aposter.html).  No, I can't
justify it.  I figured it wouldn't be taken already, and it certainly
wasn't.

## License

Copyright (c) 2015 Jacques Frechet

### The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

