tetris
======


This is a really simple project, just to have fun with javascript.  The most insteresting part of the code is that it does not use any extra library: no jquery, no underscore, ...

There is a kind of mini framework in vdom.js: it defines a VNode (virtual node), and a component (inspired by ReactJS).  All the dom manipulation is done through that small file.

Also, inspired by ReactJS, there are no external templates.  The components define the markup, keep reference to them if needed.  For this reason, there is not a single dom lookup in the whole game.
