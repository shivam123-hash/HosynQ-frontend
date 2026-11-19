export const Typography = {
  // Font Sizes
  size: {
    micro: 10,
    captionSmall: 11,
    caption: 12,
    bodySmall: 13,
    body: 14,
    bodyMedium: 15,
    subtitle: 16,
    titleSmall: 18,
    title: 20,
    titleLarge: 22,
    header: 24,
    display: 28,
    displayLarge: 32,
  },

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 28,
    header: 32,
  },
};

export type TypographyType = typeof Typography;
export default Typography;
