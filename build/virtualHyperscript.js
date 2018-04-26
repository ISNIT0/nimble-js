"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript
function isChildren(children) {
    return !children ||
        Array.isArray(children) ||
        typeof children === 'string' ||
        children.hasOwnProperty('name');
}
function makeVirtualHyperscript(uH) {
    return function wrappedHyperscript(tagName, properties, children) {
        var tag, props;
        if (!children && isChildren(properties)) {
            children = properties;
            props = {};
        }
        props = props || properties || {};
        tag = parseTag(tagName, props);
        return uH(tag, props, children || null);
    };
}
exports.default = makeVirtualHyperscript;
var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;
function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }
    var noId = !(props.hasOwnProperty('id'));
    var tagParts = tag.split(classIdSplit);
    var tagName = null;
    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }
    var classes = [];
    var part;
    var type;
    var i;
    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];
        if (!part) {
            continue;
        }
        type = part.charAt(0);
        if (!tagName) {
            tagName = part;
        }
        else if (type === '.') {
            classes.push(part.substring(1, part.length));
        }
        else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }
    if (classes.length) {
        if (props.className) {
            classes.push(props.className);
        }
        props.className = classes.join(' ');
    }
    tagName = tagName || 'div';
    return props.namespace ? tagName : tagName;
}
