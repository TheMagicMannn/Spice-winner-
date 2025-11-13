import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const backgroundImage = require('../../../assets/images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png');

const headlineWords = ['Start', 'your', 'dating', 'journey', 'today'];
const subtext = 'Join thousands of adventurous singles\nand couples exploring connections in a\nsafe, premium environment.';

export default function HeroPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ImageBackground source={backgroundImage} style={styles.background} blurRadius={2}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.flexGrow} />
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.logo}>SPICE</Text>
          <View style={styles.logoUnderline} />
        </Animated.View>
        <View style={styles.headlineContainer}>
          {headlineWords.map((word, index) => (
            <Text key={index} style={styles.headlineWord}>
              {word}
            </Text>
          ))}
        </View>
        <Animated.Text style={[styles.subtext, { opacity: fadeAnim }]}>
          {subtext}
        </Animated.Text>
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.disclaimer, { opacity: fadeAnim }]}>
            <Text style={styles.disclaimerTitle}>⚠️ Adults Only Platform</Text>
            <Text style={styles.disclaimerText}>
                Premium lifestyle community for 18+ verified members only.
            </Text>
             <Text style={styles.disclaimerText}>
                Your privacy and discretion are our top priorities.
            </Text>
        </Animated.View>
        <View style={styles.flexGrowDouble} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  flexGrow: { flex: 1 },
  flexGrowDouble: { flex: 2 },
  logo: { fontSize: 64, fontWeight: 'bold', color: 'transparent', textShadowColor: 'rgba(255, 20, 147, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30, textAlign: 'center' },
  logoUnderline: { width: 100, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 20, 147, 0.8)', alignSelf: 'center', marginBottom: 24 },
  headlineContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  headlineWord: { fontSize: 32, fontWeight: 'bold', color: 'white', marginHorizontal: 4 },
  subtext: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  buttonContainer: { width: '100%', maxWidth: 400, gap: 16 },
  button: { paddingVertical: 16, backgroundColor: '#1A1A1A', borderRadius: 100, borderWidth: 2, borderColor: 'rgba(255,105,180,0.5)' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  disclaimer: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,105,180,0.6)', padding: 16, marginTop: 40, maxWidth: 400 },
  disclaimerTitle: { fontWeight: 'bold', fontSize: 16, color: 'white', textAlign: 'center', marginBottom: 8 },
  disclaimerText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 16 }
});
