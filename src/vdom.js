class VNode {
    constructor (tagName, props, ...children) {
        this.node = document.createElement(tagName);
        for (let prop of Object.keys(props || {})) {
            if (prop === 'className') {
                if (props.className instanceof Array) {
                    for (let c of props.className) {
                        this.node.classList.add(c);
                    }
                } else {
                    this.node.classList.add(props.className);
                }
            } else {
                this.node.setAttribute(prop, props[prop]);
            }
        }
        for (let child of children) {
            if (typeof child === 'string') {
                this.node.appendChild(document.createTextNode(child));
            }
            if (child instanceof VNode) {
                this.node.appendChild(child.node);
            }
            if (child instanceof Component) {
                this.node.appendChild(child.render().node);
            }
        }
    }
    style (css) {
        for (let prop of Object.keys(css)) {
            this.node.style[prop] = css[prop];
        }
        return this;
    }
}

//-----------------------------------------------------------------------------
function makeTagNode (tagName) {
    return function (...args) {return new VNode (tagName, ...args);};
}

let tags = ['div', 'h1', 'p'];

for (let tag of tags) {
    module.exports[tag] = makeTagNode(tag);
}

//-----------------------------------------------------------------------------
let handlers = {};

class Component {
    constructor (props , ...children) {
        this.props = props || {};
        this.children = children;
    }
    appendTo(parent) {
        this.parent = parent;
        this.node = this.getNode();
        parent.appendChild(this.node);
        this.componentDidMount();
    }
    componentDidMount () {
    }
    onAction(name, handler) {
        if (name in handlers) {
            handlers[name].push(handler);
        } else {
            handlers[name] = [handler];
        }
    }
    getNode() {
        let vnode = this.render();
        while (!(vnode instanceof VNode)) {vnode = vnode.render();}
        return vnode.node;
    }
    update () {
        while (this.parent.firstChild) {
          this.parent.removeChild(this.parent.firstChild);
        }
        this.appendTo(this.parent);
    }
}
module.exports.Component = Component;

//-----------------------------------------------------------------------------
function createAction (name) {
    if (!(name in handlers)) {
        handlers[name] = [];
    }
    return function (...args) {
        for (let handler of handlers[name]) {
            handler(...args);
        }
    };
}

function createActions(...names) {
    let result = {};
    for (let name of names) {
        result[name] = createAction(name);
    }
    return result;
}
module.exports.createActions = createActions;
