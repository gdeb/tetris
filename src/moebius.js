
function createClass () {
    var props = (arguments[1] ? arguments[1] : arguments[0]),
        prop_names = Object.keys(props),
        Parent = arguments[1] && arguments[0];

    var Constructor = props.init || function () {
        Parent && Parent.apply(this, arguments);
    };
    if (Parent) Constructor.prototype = Object.create(Parent.prototype);
    for (var i = 0; i < prop_names.length; i++) {
        if (prop_names[i] !== 'init')
            Constructor.prototype[prop_names[i]] = props[prop_names[i]];
    }
    return Constructor;
}
module.exports.createClass = createClass;
//-----------------------------------------------------------------------------
var handlers = {};

function createAction (name) {
    if (!(name in handlers)) handlers[name] = [];
    return function () {
        var args = Array.prototype.slice.call(arguments);
        handlers[name].forEach(function (handler) {
            handler.apply(null, args);
        });
    };
}
function createActions () {
    var names = Array.prototype.slice.call(arguments),
        result = {};
    names.forEach(function (name) {
        result[name] = createAction(name);
    });
    return result;
}
module.exports.createActions = createActions;

//-----------------------------------------------------------------------------
var VNode = createClass({
    appendTo: function () {},
    destroy: function () {},
});

//-----------------------------------------------------------------------------
var HtmlVNode = createClass(VNode, {
    init: function (tagName, props) {
        this.node = document.createElement(tagName);
        this.children = [];
        var children = Array.prototype.slice.call(arguments, 2);
        for (var j = 0; j < children.length; j++) {
            this.children = this.children.concat(children[j]);
        }
        var keys = Object.keys(props || {});
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === 'className') {
                if (props.className instanceof Array) {
                    this.node.classList.add.apply(this.node.classList, props.className);
                } else
                    this.node.classList.add(props.className);            
            } else if (keys[i] === 'onClick') {
                this.node.addEventListener('click', props.onClick);
            } else {
                this.node.setAttribute(keys[i], props[keys[i]]);
            }
        }
    },
    appendTo: function (parentNode) {
        this.parentNode = parentNode;
        for (var i = 0; i < this.children.length; i++) {
            if (typeof this.children[i] === 'string') {
                this.node.appendChild(document.createTextNode(this.children[i]));
            }
            if (this.children[i] instanceof VNode) {
                this.children[i].appendTo(this.node);
            }
        }
        parentNode.appendChild(this.node);        
    },
    style: function (css) {
        var props = Object.keys(css);
        for (var i = 0; i < props.length; i++) {
            this.node.style[props[i]] = css[props[i]];
        }
        return this;
    },
    destroy: function () {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof VNode) {
                this.children[i].destroy();
            }
        }
        this.parentNode.removeChild(this.node);
        this.node = undefined;
        this.parentNode = undefined;
    },
});

//-----------------------------------------------------------------------------
var Component = createClass(VNode, {
    init: function (props) {
        this.props = props || {};
        this.children = Array.prototype.slice.call(arguments, 1);
    },
    render: function () {},
    appendTo: function (parentNode) {
        this.parentNode = parentNode;
        this.vnode = this.render();
        if (this.vnode) this.vnode.appendTo(parentNode);
    },
    onAction: function (name, handler) {
        if (name in handlers) handlers[name].push(handler);
        else handlers[name] = [handler];
    },
    destroy: function () {
        if (this.parentNode && this.vnode) {
            this.vnode.destroy();
            this.vnode = null;
            this.parentNode = null;
        }
    },
});
module.exports.Component = Component;

//-----------------------------------------------------------------------------
var htmlTags = ['div', 'p', 'h1', 'canvas'];
htmlTags.forEach(function (tag) {
    module.exports[tag] = function () {
        var vnode = Object.create(HtmlVNode.prototype);
        var args = [tag].concat(Array.prototype.slice.call(arguments));
        HtmlVNode.apply(vnode, args);
        return vnode;
    };
});
