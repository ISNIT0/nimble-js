import { VNode, h as uH, Children } from 'ultradom';
export type UH = typeof uH;

//https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript

export default function makeVirtualHyperscript(uH: UH) {
    return function wrappedHyperscript(tagName: string, properties?: any, children?: Children[] | Children): VNode {
        let tag, props;

        if (!children && Array.isArray(properties)) {
            children = properties;
            props = {};
        }

        props = props || properties || {};
        tag = parseTag(tagName, props);

        

        return uH(tag, props, children || null);
    }
}


const classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
const notClassId = /^\.|#/;

function parseTag(tag: string, props: any) {
    if (!tag) {
        return 'DIV';
    }

    let noId = !(props.hasOwnProperty('id'));

    let tagParts = tag.split(classIdSplit);
    let tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    let classes: string[] = [];
    let part;
    let type;
    let i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
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