
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
function VNode (tagName, props) {
    var i,
        children = Array.prototype.slice.call(arguments, 2),
        keys = Object.keys(props || {});
    this.node = document.createElement(tagName);
    for (i = 0; i < keys.length; i++) {
        if (keys[i] === 'className') {
            this.node.classList.add(props.className);
        } else if (keys[i] === 'onClick') {
            this.node.addEventListener('click', props.onClick);
        } else {
            this.node.setAttribute(keys[i], props[keys[i]]);
        }
    }
    for (i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
            this.node.appendChild(document.createTextNode(children[i]));
        }
        if (children[i] instanceof VNode) {
            this.node.appendChild(children[i].node);
        }
    }
}

VNode.prototype.style = function (css) {
    var props = Object.keys(css);
    for (var i = 0; i < props.length; i++) {
        this.node.style[props[i]] = css[props[i]];
    }
    return this;
};

var tags = ['div', 'p', 'h1'];
tags.forEach(function (tag) {
    module.exports[tag] = function () {
        var vnode = Object.create(VNode.prototype);
        var args = [tag].concat(Array.prototype.slice.call(arguments));
        VNode.apply(vnode, args);
        return vnode;
    };
});

//-----------------------------------------------------------------------------
function Component (props) {
    this.props = props || {};
    this.children = Array.prototype.slice.call(arguments, 1);
    this.vnode = this.render();
    while (this.vnode instanceof Component) {
        this.vnode = this.vnode.render();
    }
}

Component.prototype.render = function () {};
Component.prototype.appendTo = function (parent) {
    this.parent = parent;
    if (this.vnode) parent.appendChild(this.vnode.node);
};
Component.prototype.destroy = function () {
    if (this.parent && this.vnode) {
        this.parent.removeChild(this.vnode.node);
    }
};
Component.prototype.onAction = function (name, handler) {
    if (name in handlers) handlers[name].push(handler);
    else handlers[name] = [handler];
};

module.exports.Component = Component;
