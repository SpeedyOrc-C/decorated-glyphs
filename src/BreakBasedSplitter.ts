export default class BreakBasedSplitter {
    static breakable(c: string): boolean {
        return c.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\uFF00-\uFFEF\u3000 ]/) !== null
    }

    static nonBreakable(c: string): boolean {
        return !BreakBasedSplitter.breakable(c)
    }

    static split(s: string) {
        let chars = s.split("")
        const words: string[][] = []

        while (chars.length > 0) {
            const nonBreakableEnd = chars.findIndex(BreakBasedSplitter.breakable)

            if (nonBreakableEnd == -1) {
                words.push(chars)
                break
            } else {
                words.push(chars.slice(0, nonBreakableEnd))
                chars = chars.slice(nonBreakableEnd)
            }

            const breakableEnd = chars.findIndex(BreakBasedSplitter.nonBreakable)

            if (breakableEnd == -1) {
                words.push(...chars.map(char => [char]))
                break
            } else {
                words.push(...chars.slice(0, breakableEnd).map(char => [char]))
                chars = chars.slice(breakableEnd)
            }
        }

        return words
    }
}