export const Colors = {
  // Canvas & Backgrounds
  background: '#0B1A2F', // Canvas background (Ink 950)
  cardBackground: '#122440', // Surface / Card background (Ink 900)
  cardElevated: '#1A2D47', // Elevated surface
  cardInset: '#0B1726', // Inset card background
  cardInsetAlt: '#0B1728',
  cardInsetDark: '#0A131F', // Deepest dark container / header / bottom bar

  // Surfaces & Layers
  surfaceDeep: '#112030',
  surfaceDropzone: '#112136',
  surfaceCardDark: '#13243B',
  surfaceCardAlt: '#142232',
  surfaceSubtle: '#162434', // Secondary chips / subtle cards
  surfaceHighlight: '#162536', // Search bar / active list item
  surfaceElevated2: '#182A40',
  surfaceElevated3: '#1A2F4A',
  surfaceNavy: '#1D3252',
  surfaceNavyLight: '#1E3550',
  surfaceNavyDark: '#1C2F46',
  surfaceNavyDeep: '#1C314E',
  surfaceNavyAlt: '#1A2C46',
  surfaceNavyDark2: '#16284A',
  surfaceNavyBorder: '#243A5E',
  surfaceMuted: '#26374D',
  surfaceMutedAlt: '#2A3D54',

  // Error Surfaces
  errorSurface: '#1F1926',
  errorSurfaceSubtle: '#1A1826',
  bannerErrorBg: '#5C2D3B',
  bannerErrorBorder: '#E84A5F',

  // Borders & Dividers
  border: '#1F3249', // Border line (Ink 800)
  borderSubtle: '#192A44',
  borderBold: '#1F3352', // Active border / card outline
  borderNavy: '#1F3352',
  borderMedium: '#24364D',
  borderMuted: '#334457',
  borderMutedAlt: '#3A4556',
  borderLight: '#3D5066',
  borderLightAlt: '#4A5B73',

  // Primary Brand Colors (HosynQ Warm Amber / Orange)
  primary: '#F0913A', // Primary warm amber base
  primaryHover: '#FF8A3D',
  primaryLight: '#FFB04A',
  primaryDark: '#E88C35',
  primarySubtle: '#F7C08E',
  amberLight: '#F7C08E',
  amberDark: '#B55D17',

  // Button & Interactive
  buttonBackground: '#F0913A',
  buttonText: '#FFFFFF',
  inactiveIndicator: '#16283E',

  // Inputs
  inputBackground: '#122440',
  inputBorder: '#1F3249',
  inputActiveBorder: '#273C56',
  inputLabel: '#858E9A',
  inputText: '#FFFFFF',

  // Text Hierarchy
  text: '#FFFFFF', // Text primary
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  textNearWhite: '#EDF2F7',
  textNearWhiteAlt: '#DCE6F1',
  textNearWhiteSoft: '#D8E2ED',
  textLightMuted: '#C5D2E0',
  textLightMutedAlt: '#CAD4DF',
  textMutedLight: '#A8B7C7',
  textSecondary: '#858E9A', // Text secondary
  textSecondaryMuted: '#8A97AB',
  textSecondarySoft: '#78869A',
  textSubtle: '#8E9BAE', // Text subtle / tags / meta
  textTertiary: '#7D8B9B',
  textTertiaryAlt: '#7D8E9F',
  textPlaceholder: '#6E8096',
  textPlaceholderAlt: '#687B91',
  textMuted: '#506173', // Text muted / inactive
  textMutedAlt: '#5C6E82',
  textMutedSoft: '#6D8096',
  textMutedSlate: '#5C6B7E',

  // Semantic & Feedback
  success: '#10B981',
  successGreen: '#1FA066',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerRed: '#E84A5F',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.15)',

  // Category & Accent Palette
  accentBlue: '#3A8EF0',
  accentBlueLight: '#5B9CF6',
  accentBlueSoft: '#8DB8F5',
  accentTeal: '#2EC4B6',
  accentCyan: '#00C2CB',
  accentPurple: '#9D65E5',
  accentPurpleLight: '#A370F7',
  accentRed: '#E84A5F',
  accentGreen: '#1FA066',
  accentGreenSoft: '#9BD4A8',
  accentYellow: '#F2C14D',
  accentPink: '#F3A3CC',

  // Avatar Backgrounds
  avatarBrown: '#4A2E1A',
  avatarNavy: '#1F3A66',
  avatarGreen: '#253F2D',
  avatarWine: '#4B1F3A',
  avatarOlive: '#493A12',

  // Document & Vault Graphics
  docBg: '#EBE7DF',
  docLine: '#B5B1A8',
  docText: '#7A766F',

  // Toast & Modals
  toastBg: '#0A131F',
  toastBorder: '#1F3352',
  toastText: '#E6EDF5',
};

export type ColorsType = typeof Colors;
export default Colors;
