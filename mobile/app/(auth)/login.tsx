import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useToast } from '../../../src/hooks/useToast';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Checkbox } from '../../../src/components/Checkbox';
import { Label } from '../../../src/components/Label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

const backgroundImage = require('../../../assets/images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png');

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const { error } = await login(email, password);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
    // On success, the useAuth hook will handle navigation.
    setIsLoading(false);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SPICE</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Welcome Back</Text>
          <Text style={styles.description}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail color="rgba(255, 255, 255, 0.6)" size={20} style={styles.icon} />
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Lock color="rgba(255, 255, 255, 0.6)" size={20} style={styles.icon} />
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff color="rgba(255, 255, 255, 0.6)" size={20} /> : <Eye color="rgba(255, 255, 255, 0.6)" size={20} />}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.checkboxContainer}>
              <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
              <Label style={{color: '#aaa', marginLeft: 8}}>Remember me</Label>
            </View>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!email || !password}
          >
            Sign In
          </Button>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.footer}>
            <Text style={{color: '#aaa'}}>New to SPICE? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.link}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff1493',
    textShadowColor: 'rgba(255, 20, 147, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleUnderline: {
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff69b4',
    marginVertical: 12,
    shadowColor: 'rgba(255, 20, 147, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
  },
  input: {
    paddingLeft: 45,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    color: '#ff69b4',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  dividerText: {
    color: '#aaa',
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
