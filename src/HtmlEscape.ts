export function htmlEscapeChar(c: string): string {
    if (c == '<') return '&lt;'
    if (c == '>') return '&gt;'
    if (c == '&') return '&amp;'
    if (c == '"') return '&quot;'
    if (c == "'") return '&#039;'
    if (c == " ") return '&nbsp;'
    return c
}

export function htmlEscape(s: string): string {
    let r = ""
    for (let i = 0; i < s.length; i++) {
        r += htmlEscapeChar(s.charAt(i))
    }
    return r
}
