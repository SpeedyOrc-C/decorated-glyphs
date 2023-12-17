import {IBaseNode, Tag, TagVoid, TextNode} from "crazy-parser";

export function traverseTextNodes(node: IBaseNode, callback: (node: TextNode) => void): void {
    if (node instanceof TextNode) {
        callback(node);
        return;
    }

    if (node instanceof TagVoid) {
        return;
    }

    if (!(node instanceof Tag)) {
        throw new Error("Unexpected node type: " + node.constructor.name);
    }

    for (const child of node.children) {
        traverseTextNodes(child, callback);
    }
}
