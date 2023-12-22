export default class TextWithImageBackgroundConfig {
    constructor(
        public fontSize: string = "1rem",
        public background: string | null = null,
        public foreground: string | null = null,
        public stretchTextBackground = false,
        public stretchBackground = false,
        public stretchForeground = false,
    )
    {
    }

    setFontSize(value: string): TextWithImageBackgroundConfig
    {
        this.fontSize = value;
        return this;
    }

    setBackground(value: string | null): TextWithImageBackgroundConfig
    {
        this.background = value;
        return this;
    }

    setForeground(value: string | null): TextWithImageBackgroundConfig
    {
        this.foreground = value;
        return this;
    }

    setStretchTextBackground(value: boolean): TextWithImageBackgroundConfig
    {
        this.stretchTextBackground = value;
        return this;
    }

    setStretchBackground(value: boolean): TextWithImageBackgroundConfig
    {
        this.stretchBackground = value;
        return this;
    }

    setStretchForeground(value: boolean): TextWithImageBackgroundConfig
    {
        this.stretchForeground = value;
        return this;
    }
}