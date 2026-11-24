import { StyleSheet } from 'react-native';
import Fonts from './FontsStyle';

export function getRobotoFont(fontWeight?: string | number, styleKey?: string): string {
  const lowerKey = (styleKey || '').toLowerCase();

  // Subtitles, captions, descriptions, helpers, hints should be Light font
  if (
    lowerKey.includes('subtitle') ||
    lowerKey.includes('caption') ||
    lowerKey.includes('desc') ||
    lowerKey.includes('helper') ||
    lowerKey.includes('hint') ||
    lowerKey.includes('subtext') ||
    lowerKey.includes('footer')
  ) {
    return Fonts.light;
  }

  if (!fontWeight) return Fonts.regular;
  const w = String(fontWeight).trim().toLowerCase();
  if (w === '700' || w === '800' || w === '900' || w === 'bold' || w === 'heavy') {
    return Fonts.bold;
  }
  if (w === '600' || w === 'semibold') {
    return Fonts.semiBold;
  }
  if (w === '500' || w === 'medium') {
    return Fonts.medium;
  }
  if (w === '100' || w === '200' || w === '300' || w === 'light') {
    return Fonts.light;
  }
  return Fonts.regular;
}

const TEXT_PROPERTY_KEYS = [
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textTransform',
  'textDecorationLine',
  'textDecorationStyle',
  'includeFontPadding',
  'fontStyle',
];

const TEXT_NAME_SUBSTRINGS = [
  'text',
  'title',
  'label',
  'header',
  'heading',
  'subtitle',
  'caption',
  'desc',
  'input',
  'placeholder',
  'btn',
  'button',
  'pill',
  'badge',
  'name',
  'value',
  'error',
  'helper',
  'message',
  'msg',
  'count',
  'tab',
  'link',
];

function isTextLikeStyle(styleObj: any, styleKey: string): boolean {
  if (!styleObj || typeof styleObj !== 'object') return false;

  for (let i = 0; i < TEXT_PROPERTY_KEYS.length; i++) {
    if (TEXT_PROPERTY_KEYS[i] in styleObj) {
      return true;
    }
  }

  const lowerKey = styleKey.toLowerCase();
  for (let i = 0; i < TEXT_NAME_SUBSTRINGS.length; i++) {
    if (lowerKey.includes(TEXT_NAME_SUBSTRINGS[i])) {
      if ('color' in styleObj) {
        return true;
      }
    }
  }

  return false;
}

// Global interceptor for StyleSheet.create to apply Roboto font family and strip fontWeight
const originalStyleSheetCreate = StyleSheet.create;

(StyleSheet as any).create = function <T extends Record<string, any>>(styles: T): T {
  if (!styles || typeof styles !== 'object') {
    return originalStyleSheetCreate(styles);
  }

  const modifiedStyles: any = {};
  for (const [key, value] of Object.entries(styles)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (isTextLikeStyle(value, key)) {
        const styleCopy = { ...(value as object) } as any;

        // Apply custom font if not explicitly set
        if (!styleCopy.fontFamily) {
          styleCopy.fontFamily = getRobotoFont(styleCopy.fontWeight, key);
        }

        // CRITICAL: Delete fontWeight so it doesn't conflict/override custom font family in React Native!
        delete styleCopy.fontWeight;

        modifiedStyles[key] = styleCopy;
      } else {
        modifiedStyles[key] = value;
      }
    } else {
      modifiedStyles[key] = value;
    }
  }

  return originalStyleSheetCreate(modifiedStyles);
};

export { Fonts };
export default Fonts;
