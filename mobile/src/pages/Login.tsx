import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

const backgroundImage = require('../../assets/images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png');
// import { useAuth } from '../hooks/useAuth'; // To be implemented
// import { useToast } from '../hooks/useToast'; // To be implemented

export const LoginPage: React.FC = () => {
  const navigation = useNavigation();
  // const { login } = useAuth();
  // const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    // const { error } = await login(email, password); // To be implemented
    // if (error) {
    //   toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    // }
    console.log('Logging in with:', email, password);
    setTimeout(() => setIsLoading(false), 1500); // Mock async
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} blurRadius={2}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.logo}>SPICE</Text>
          <View style={styles.logoUnderline} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          <View style={styles.inputContainer}>
            <Mail color="#FF69B4" size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#FF69B4" size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#FF69B4" size={20} /> : <Eye color="#FF69B4" size={20} />}
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.rememberMe}>
                <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: "#767577", true: "#FF69B4" }}
                    thumbColor={rememberMe ? "#f4f3f4" : "#f4f3f4"}
                />
                <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to SPICE? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,105,180,0.6)',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FF1493', // Gradient approximation
    textShadowColor: 'rgba(255, 20, 147, 0.5)',
    textShadowRadius: 20,
  },
  logoUnderline: { width: 64, height: 4, borderRadius: 2, backgroundColor: '#FF69B4', alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  eyeIcon: { position: 'absolute', right: 12, zIndex: 1 },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,105,180,0.5)',
    paddingLeft: 40,
    paddingRight: 40,
    color: 'white',
  },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rememberMe: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rememberText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  forgotPassword: { color: '#FF69B4', fontSize: 14 },
  button: {
    height: 50,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,105,180,0.5)',
    marginBottom: 16
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  signupContainer: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16},
  signupText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  signupLink: { color: '#FF69B4', fontSize: 14, fontWeight: 'bold' }
});
