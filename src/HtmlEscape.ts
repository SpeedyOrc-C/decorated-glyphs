export function htmlEscapeChar(c: string): string {
    if (c == '<') return '&lt;'
    if (c == '>') return '&gt;'
    if (c == '&') return '&amp;'
    if (c == '"') return '&quot;'
    if (c == " ") return '&nbsp;'
    return c
}

export function htmlEscape(s: string): string {
    return s.split("").map(htmlEscapeChar).join("")
}
