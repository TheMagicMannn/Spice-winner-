import { StyleSheet } from 'react-native';

export const spiceTheme = {
  colors: {
    primary: '#ff1493',
    lightPink: '#ff69b4',
    softPink: '#ff91a4',
    pinkRgba: 'rgba(255, 20, 147, 0.5)',
    background: '#1a1a1a',
    card: '#2a2a2a',
    text: 'white',
    textSecondary: '#b0b0b0',
    border: 'rgba(255, 105, 180, 0.3)',
    verified: '#3498db',
    premium: '#ffd700',
    online: '#2ecc71',
  },
};

export const themeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: spiceTheme.colors.background,
  },
  card: {
    backgroundColor: spiceTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: spiceTheme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: spiceTheme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: spiceTheme.colors.textSecondary,
  },
  buttonPrimary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,105,180,0.5)',
    paddingVertical: 16,
  },
  buttonPrimaryText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textGradient: { // This will be a simple text style, as gradients require a library
    color: spiceTheme.colors.primary,
  }
});
