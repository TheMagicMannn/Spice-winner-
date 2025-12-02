import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  // Brand colors
  brandPrimary: '#ff1493', // Deep Pink
  brandSecondary: '#ff69b4', // Hot Pink
  
  // Base colors from your Tailwind config
  base100: '#101010', // Main background
  base200: '#1c1c1c', // Cards and panels
  base300: '#2d2d2d', // Borders and inputs
  
  // Text colors
  textPrimary: '#F9FAFB', // Primary text
  textSecondary: '#a0a0a0', // Secondary text
  textMuted: '#6b7280', // Muted text
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Social colors
  online: '#10b981',
  offline: '#6b7280',
  away: '#f59e0b',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Gradient stops
  gradientStart: '#ff1493',
  gradientEnd: '#ff69b4',
  
  // Border colors
  border: '#2d2d2d',
  borderLight: '#404040',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const typography = {
  // Fonts
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  
  // Line heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 12,
  },
};

export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.base100,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.base100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Cards and containers
  card: {
    backgroundColor: colors.base200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.sm,
    ...shadows.md,
  },
  cardCompact: {
    backgroundColor: colors.base200,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    margin: spacing.xs,
  },
  
  // Buttons
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...shadows.sm,
  },
  buttonLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...shadows.md,
  },
  buttonSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  primaryButton: {
    backgroundColor: colors.brandPrimary,
  },
  secondaryButton: {
    backgroundColor: colors.base300,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },
  
  // Inputs
  input: {
    backgroundColor: colors.base200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.base,
  },
  inputError: {
    borderColor: colors.error,
  },
  
  // Text
  text: {
    color: colors.textPrimary,
    fontSize: typography.base,
    lineHeight: typography.normal * typography.base,
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  caption: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  
  // Layout utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  
  // Spacing utilities
  mXs: { margin: spacing.xs },
  mSm: { margin: spacing.sm },
  mMd: { margin: spacing.md },
  mLg: { margin: spacing.lg },
  mXl: { margin: spacing.xl },
  
  pXs: { padding: spacing.xs },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },
  pXl: { padding: spacing.xl },
  
  mTopXs: { marginTop: spacing.xs },
  mTopSm: { marginTop: spacing.sm },
  mTopMd: { marginTop: spacing.md },
  mTopLg: { marginTop: spacing.lg },
  
  mBottomXs: { marginBottom: spacing.xs },
  mBottomSm: { marginBottom: spacing.sm },
  mBottomMd: { marginBottom: spacing.md },
  mBottomLg: { marginBottom: spacing.lg },
  
  // Position utilities
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  
  // Border utilities
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  borderRounded: {
    borderRadius: borderRadius.md,
  },
  borderRoundedFull: {
    borderRadius: borderRadius.full,
  },
  
  // Background utilities
  backgroundTransparent: {
    backgroundColor: 'transparent',
  },
  backgroundBase100: {
    backgroundColor: colors.base100,
  },
  backgroundBase200: {
    backgroundColor: colors.base200,
  },
  backgroundBase300: {
    backgroundColor: colors.base300,
  },
  
  // Shadow utilities
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
  shadowXl: shadows.xl,
});

// Responsive utilities
export const responsive = {
  width: (percentage: number) => Math.round((width * percentage) / 100),
  height: (percentage: number) => Math.round((height * percentage) / 100),
  fontSize: (size: number, baseWidth: number = 375) => Math.round(size * (width / baseWidth)),
  spacing: (size: number, baseWidth: number = 375) => Math.round(size * (width / baseWidth)),
  scale: (size: number, baseWidth: number = 375) => size * (width / baseWidth),
};

export const screenInfo = {
  width,
  height,
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 768,
  isLargeScreen: width >= 768,
  isTablet: width >= 768,
  isPortrait: height > width,
  isLandscape: width > height,
};