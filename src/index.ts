import TextWithImageBackground from "./TextWithImageBackground";
import BreakBasedSplitter from "./BreakBasedSplitter";
import TextWithImageBackgroundConfig from "./TextWithImageBackgroundConfig";

export function isRightToLeft(text: string): boolean {
    return text.match(/[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/) != null
}

export {
    TextWithImageBackground,
    BreakBasedSplitter,
    TextWithImageBackgroundConfig,
}
