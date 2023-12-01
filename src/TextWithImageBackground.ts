import {htmlEscapeChar} from "./HtmlEscape";

export default class TextWithImageBackground {
    text: string
    background: string

    private static hashCounter = 0
    private static hashCounterLock = false

    constructor(text: string, background: string) {
        this.text = text
        this.background = background
    }

    mount(parent: HTMLElement) {
        if (TextWithImageBackground.hashCounterLock) {
            throw new Error("This is a rare error. Please mount slowly.")
        }
        TextWithImageBackground.hashCounterLock = true
        const hash =
            new Date().getTime().toString(36)
            + TextWithImageBackground.hashCounter.toString(36)

        TextWithImageBackground.hashCounter += 1
        if (TextWithImageBackground.hashCounter > 36*36*36*36) {
            TextWithImageBackground.hashCounter = 0
        }
        TextWithImageBackground.hashCounterLock = false

        const className = "text-with-image-background-" + hash

        const element = document.createElement("div")
        element.className = className
        for (let i = 0; i < this.text.length; i += 1) {
            const innerDiv = document.createElement("div")
            innerDiv.innerHTML = htmlEscapeChar(this.text.charAt(i))
            element.appendChild(innerDiv)
        }

        const style = `
            .${className} {
                display: flex;
            }`

        const innerStyle = `
            .${className} > div {
                width: fit-content;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                background-size: 100% 100%;
                background-image: url("${this.background}");
            }`

        parent.appendChild(element)
        document.styleSheets[0].insertRule(style, 0)
        document.styleSheets[0].insertRule(innerStyle, 0)
    }
}
