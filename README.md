# gribbl
a webification technologies

Hey, if I put code in here, can CoffeeScript run it?

    console.log 'yes I can'

I guess I have to use -l, but I'm okay with that.

In real life, you would `require "gribbl"`, but I guess that won't work
here.  But I can do this:

    gribbl = require './.'
    console.log gribbl.message

For some reason, `'.'` doesn't work, even though `'..'` worked when
I had this in a test/ subdirectory.  But doing this in the README.md
is so much nicer!
