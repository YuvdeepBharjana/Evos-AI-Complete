/**
 * Removes all markdown formatting and asterisks from text
 * Use this everywhere text is displayed to ensure clean output
 */
export const cleanText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .replace(/\*\*/g, '') // Remove bold markdown **
    .replace(/\*/g, '') // Remove italic/asterisks *
    .replace(/#/g, '') // Remove headers #
    .replace(/`/g, '') // Remove code blocks `
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links [text](url) -> text
    .replace(/_{2,}/g, '') // Remove underscores __
    .replace(/~{2,}/g, '') // Remove strikethrough ~~
    .trim();
};





