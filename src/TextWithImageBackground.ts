import {htmlEscapeChar} from "./HtmlEscape";
import BreakBasedSplitter from "./BreakBasedSplitter";

export default class TextWithImageBackground {
    text: string
    background: string

    private static hashCounter = 0
    private static hashCounterLock = false

    constructor(text: string, background: string) {
        this.text = text
        this.background = background
    }

    private generateHash(): string {
        if (TextWithImageBackground.hashCounterLock) {
            throw new Error("This is a rare error. Please mount slowly.")
        }
        TextWithImageBackground.hashCounterLock = true
        const hash = new Date().getTime().toString(36)
            + TextWithImageBackground.hashCounter.toString(36)
        TextWithImageBackground.hashCounter += 1
        if (TextWithImageBackground.hashCounter > 36*36*36*36) {
            TextWithImageBackground.hashCounter = 0
        }
        TextWithImageBackground.hashCounterLock = false

        return hash
    }

    htmlCss(): [string, [string, string]] {
        const className = "text-with-image-background-" + this.generateHash()
        const words = BreakBasedSplitter.split(this.text)

        const html =
            `<div class="${className}">` + words.map(word =>
                "<div>" + word.map(c =>
                    "<div>" +
                        htmlEscapeChar(c) +
                    "</div>").join("") +
                "</div>").join("") +
            "</div>"

        const style = [
            `.${className} > div {`,
                `display: inline-block;`,
            `}`,
        ].join(" ").trim()

        const innerStyle = [
            `.${className} > div > div {`,
                `display: inline-block;`,
                `-webkit-background-clip: text;`,
                `background-clip: text;`,
                `-webkit-text-fill-color: transparent;`,
                `background-size: 100% 100%;`,
                `background-image: url("${this.background}");`,
            `}`,
        ].join(" ").trim()

        return [html, [style, innerStyle]]
    }
}
