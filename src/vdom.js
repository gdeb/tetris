
let handlers = {};

function createAction (name) {
    return function (...args) {
        handlers[name].forEach(handler => handler(...args));
    };
}
function createActions(...names) {
    let result = {};
    for (let name of names) {
        if (!(name in handlers)) handlers[name] = [];
        result[name] = createAction (name);
    }
    return result;
}
module.exports.createActions = createActions;

//-----------------------------------------------------------------------------
class Component {
    constructor (props , ...children) {
        this.props = props || {};
        this.children = children;
    }
    appendTo (parent) {
        this.parent = parent;
        this.node = this.render();
        if (this.node) {
            this.node.appendTo(parent);
        }
        this.componentDidMount();
    }
    componentDidMount () {}
    componentWillUnmount () {}
    render () {}
    onAction(name, handler) {
        if (name in handlers) {
            handlers[name].push(handler);
        } else {
            handlers[name] = [handler];
        }
    }
    update () {
        if (this.node) this.node.componentWillUnmount();
        while (this.parent.firstChild) {
          this.parent.removeChild(this.parent.firstChild);
        }
        this.appendTo(this.parent);
    }
}
module.exports.Component = Component;

//-----------------------------------------------------------------------------
class VNode extends Component {
    constructor (tagName, props, ...children) {
        super(props, ...children);
        this.tagName = tagName;
        this.css = {};
    }
    appendTo (parent) {
        this.node = document.createElement(this.tagName);
        for (let prop of Object.keys(this.props)) {
            if (prop === 'className') {
                if (this.props.className instanceof Array) {
                    for (let c of this.props.className) {
                        this.node.classList.add(c);
                    }
                } else {
                    this.node.classList.add(this.props.className);
                }
            } else if (prop === 'onClick') {
                this.node.addEventListener('click', this.props.onClick);
            } else {
                this.node.setAttribute(prop, this.props[prop]);
            }
        }
        for (let prop of Object.keys(this.css)) {
            this.node.style[prop] = this.css[prop];
        }
        for (let child of this.children) {
            if (typeof child === 'string') {
                this.node.appendChild(document.createTextNode(child));
            }
            if (child instanceof Component) {
                child.appendTo(this.node);
            }
        }
        parent.appendChild(this.node);
    }
    style (css) {
        this.css = css;
        return this;
    }
}

//-----------------------------------------------------------------------------
function makeTagNode (tagName) {
    return function (...args) {return new VNode (tagName, ...args);};
}

let tags = ['div', 'h1', 'p', 'canvas'];

for (let tag of tags) {
    module.exports[tag] = makeTagNode(tag);
}
