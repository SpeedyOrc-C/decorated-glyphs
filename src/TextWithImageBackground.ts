import {htmlEscapeChar} from "./HtmlEscape";
import BreakBasedSplitter from "./BreakBasedSplitter";
import {div, documentP, Tag, TextNode} from "crazy-parser";
import {traverseTextNodes} from "./Traverser";
import TextWithImageBackgroundConfig from "./TextWithImageBackgroundConfig";

export default class TextWithImageBackground
{
    private static hashCounter = 0
    private static hashCounterLock = false
    private readonly hash: string

    constructor(
        private readonly text: string,
        private readonly textBackground: string,
        private readonly config: TextWithImageBackgroundConfig)
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

        const bodyClasses: string[] = [
            ...this.config.stretchTextBackground ? ["stretch-text-bg"] : [],
            ...this.config.stretchBackground ? ["stretch-bg"] : [],
            ...this.config.stretchForeground ? ["stretch-fg"] : [],
        ]

        const body = div([["id", idName], ["class", bodyClasses.join(" ")]],
            words.map(word => div([["class", "word"]],
                word.map(character => div([["class", "character"]], [
                    ...this.config.background != null && character != " " ?
                        [div([["class", "background"]])] : [],
                    div([["class", "glyph"]], [
                        new TextNode(character)
                    ]),
                    ...this.config.foreground != null && character != " " ?
                        [div([["class", "foreground"]])] : [],
                    div([["class", "placeholder"]], [
                        new TextNode(character)
                    ]),
                ]))
            ))
        )

        const styleWord = [
            `#${idName} .word {`,
            `display: inline-block;`,
            `}`,
        ].join("")

        const styleWordRtl = [
            `html[dir="rtl"] #${idName} .word {`,
            `float: right;`,
            `}`,
        ].join("")

        const styleCharacter: string = [
            `#${idName} .character {`,
            `display: inline-block;`,
            `position: relative;`,
            `font-size: ${this.config.fontSize};`,
            `}`,
        ].join("")

        const styleCharacterRtl: string = [
            `html[dir="rtl"] #${idName} .character {`,
            `float: right;`,
            `}`,
        ].join("")

        const styleGlyph: string = [
            `#${idName} .glyph {`,
            `position: absolute;`,
            `background-image: url("${htmlEscapeChar(this.textBackground)}");`,
            `-webkit-background-clip: text;`,
            `background-clip: text;`,
            `color: transparent;`,
            `background-position-x: center;`,
            `background-size: auto 100%;`,
            `}`,
        ].join("")

        const styleGlyphStretch: string = [
            `#${idName}.stretch-text-bg .glyph {`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("")

        const styleForeground: string | null = this.config.foreground != null ? [
            `#${idName} .foreground {`,
            `background-image: url("${htmlEscapeChar(this.config.foreground)}");`,
            `background-size: auto 100%;`,
            `}`,
        ].join("") : null

        const styleForegroundStretch: string | null = this.config.foreground != null ? [
            `#${idName}.stretch-fg .foreground {`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("") : null

        const styleBackground: string | null = this.config.background != null ? [
            `#${idName} .background {`,
            `background-image: url("${htmlEscapeChar(this.config.background)}");`,
            `background-size: auto 100%;`,
            `}`,
        ].join("") : null

        const styleBackgroundStretch: string | null = this.config.background != null ? [
            `#${idName}.stretch-bg .background {`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("") : null

        const styleBackgroundForeground: string = [
            `#${idName} .background, #${idName} .foreground {`,
            `position: absolute;`,
            `height: 100%;`,
            `width: 100%;`,
            `background-position-x: center;`,
            `background-size: auto 100%;`,
            `}`,
        ].join("")

        const styleBackgroundForegroundStretch: string = [
            `#${idName}.stretch .background, #${idName}.stretch .foreground {`,
            `background-size: 100% 100%;`,
            `}`,
        ].join("")

        const styleBackgroundForegroundGlyph: string = [
            `#${idName} .background, #${idName} .foreground, #${idName} .glyph {`,
            `-webkit-user-select: none;`,
            `-moz-user-select: none;`,
            `user-select: none;`,
            `}`,
        ].join("")


        const stylePlaceholder: string = [
            `#${idName} .placeholder {`,
            `color: transparent;`,
            `}`,
        ].join("")

        const styles: string[] = [
            styleWord,
            styleWordRtl,
            styleCharacter,
            styleCharacterRtl,
            styleGlyph,
            styleGlyphStretch,
            styleBackgroundForeground,
            styleBackgroundForegroundStretch,
            styleBackgroundForegroundGlyph,
            stylePlaceholder,
        ]

        if (styleForeground != null) styles.push(styleForeground)
        if (styleBackground != null) styles.push(styleBackground)
        if (styleForegroundStretch != null) styles.push(styleForegroundStretch)
        if (styleBackgroundStretch != null) styles.push(styleBackgroundStretch)

        return [body, styles]
    }

    static async convert(
        rawHtml: string,
        textBackground: string,
        config = new TextWithImageBackgroundConfig(),
    ): Promise<string>
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
            const textWithImageBackground =
                new TextWithImageBackground(text, textBackground, config)
            const [body, styles_] = textWithImageBackground.component()

            node.replaceWith(body)
            styles.push(...styles_)
        })

        return [
            `<!DOCTYPE html>`,
            `<html>`,
            `<head>`,
            `<meta charset="UTF-8">`,
            `<style>${styles.join(" ")}</style>`,
            `</head>`,
            `${body.dump()}`,
            `</html>`,
        ].join("")
    }
}
