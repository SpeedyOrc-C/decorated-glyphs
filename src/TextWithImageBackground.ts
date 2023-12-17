import {htmlEscapeChar} from "./HtmlEscape";
import BreakBasedSplitter from "./BreakBasedSplitter";
import {div, documentP, Tag, TextNode} from "crazy-parser";
import {traverseTextNodes} from "./Traverser";

export default class TextWithImageBackground
{
    private static hashCounter = 0
    private static hashCounterLock = false
    private readonly hash: string

    constructor(
        public text: string,
        public textBackground: string,
        public fontSize: string | null = "1rem",
        public background: string | null = null,
        public foreground: string | null = null,
    )
    {
        this.hash = this.generateHash()
    }

    private generateHash(): string
    {
        if (TextWithImageBackground.hashCounterLock) {
            throw new Error("This is a rare error. Please mount slowly.")
        }
        TextWithImageBackground.hashCounterLock = true
        const hash = new Date().getTime().toString(36)
            + TextWithImageBackground.hashCounter.toString(36)
        TextWithImageBackground.hashCounter += 1
        if (TextWithImageBackground.hashCounter > 36 * 36 * 36 * 36) {
            TextWithImageBackground.hashCounter = 0
        }
        TextWithImageBackground.hashCounterLock = false

        return hash
    }

    component(): [Tag, string[]]
    {
        const idName = "text-with-image-background-" + this.hash
        const words = BreakBasedSplitter.split(this.text)

        const body =
            div([["id", idName]],
                words.map(word => div([["class", "word"]],
                    word.map(character => div([["class", "character"]], [
                        ...this.background != null && character != " " ?
                            [div([["class", "background"]])] : [],
                        div([["class", "glyph"]], [
                            new TextNode(htmlEscapeChar(character))
                        ]),
                        ...this.foreground != null && character != " " ?
                            [div([["class", "foreground"]])] : [],
                        div([["class", "placeholder"]], [
                            new TextNode(htmlEscapeChar(character))
                        ]),
                    ]))
                ))
            )

        const styleWord = [
            `#${idName} .word {`,
                `display: inline-block;`,
            `}`,
        ].join("")

        const styleCharacter: string = [
            `#${idName} .character {`,
            `display: inline-block;`,
            `position: relative;`,
            `font-size: ${this.fontSize};`,
            `}`,
        ].join("")

        const styleBackground: string = [
            `#${idName} .background {`,
            `position: absolute;`,
            `height: 100%;`,
            `width: 100%;`,
            `background-image: url("${this.background}");`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("")

        const styleGlyph: string = [
            `#${idName} .glyph {`,
            `position: absolute;`,
            `background-image: url("${this.textBackground}");`,
            `-webkit-background-clip: text;`,
            `background-clip: text;`,
            `-webkit-text-fill-color: transparent;`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("")

        const styleForeground: string = [
            `#${idName} .foreground {`,
            `position: absolute;`,
            `height: 100%;`,
            `width: 100%;`,
            `background-image: url("${this.foreground}");`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("")

        const stylePlaceholder: string = [
            `#${idName} .placeholder {`,
                `color: transparent;`,
            `}`,
        ].join("")

        return [body, [
            styleWord, styleCharacter,
            styleBackground, styleGlyph,
            styleForeground, stylePlaceholder,
        ]]
    }

    static async convert(
        rawHtml: string,
        textBackground: string,
        fontSize: string = "1rem",
        title: string | null = "Untitled",
        background: string | null = null,
        foreground: string | null = null): Promise<string>
    {
        const [tags] = await documentP(rawHtml)
        const body = new Tag("body", [], tags)
        body.flattenInline()

        const styles: string[] = []

        traverseTextNodes(body, node =>
        {
            if (node.parent != null && node.parent.children.length !== 1) {
                throw new Error("Tags are not fully flattened.")
            }

            const text = node.text
            const textWithImageBackground = new TextWithImageBackground(
                text, textBackground, fontSize, background, foreground)
            const [body, styles_] = textWithImageBackground.component()

            node.replaceWith(body)
            styles.push(...styles_)
        })

        return [
            `<!DOCTYPE html>`,
            `<html>`,
            `<head>`,
            `<meta charset="UTF-8">`,
            `<title>${title}</title>`,
            `<style>${styles.join(" ")}</style>`,
            `</head>`,
            `${body.dump()}`,
            `</html>`,
        ].join("")
    }
}
