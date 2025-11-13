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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Calendar, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

const backgroundImage = require('../../assets/images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png');
// import { useAuth } from '../hooks/useAuth'; // To be implemented
// import { useToast } from '../hooks/useToast'; // To be implemented

export const SignupPage: React.FC = () => {
  const navigation = useNavigation();
  // const { signUp } = useAuth();
  // const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (password !== confirmPassword) {
      // toast({ title: "Error", description: "Passwords don't match" });
      console.error("Passwords don't match");
      return;
    }
    setLoading(true);
    // const { error } = await signUp(email, password, name, age);
    console.log('Signing up with:', { email, password, name, age });
    setTimeout(() => setLoading(false), 1500); // Mock async
  };

  const isFormValid = email && password && confirmPassword && name && age && password.length >= 6 && password === confirmPassword && agreeToTerms && agreeToPrivacy && !loading;

  return (
    <ImageBackground source={backgroundImage} style={styles.background} blurRadius={2}>
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.logo}>SPICE</Text>
          <View style={styles.logoUnderline} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the premium lifestyle community</Text>

          <View style={styles.inputContainer}><User color="#FF69B4" size={16} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="rgba(255,255,255,0.6)" value={name} onChangeText={setName} /></View>
          <View style={styles.inputContainer}><Calendar color="#FF69B4" size={16} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your age (18+)" placeholderTextColor="rgba(255,255,255,0.6)" value={age} onChangeText={setAge} keyboardType="number-pad" /></View>
          <View style={styles.inputContainer}><Mail color="#FF69B4" size={16} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="rgba(255,255,255,0.6)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>

          <View style={styles.inputContainer}>
            <Lock color="#FF69B4" size={16} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor="rgba(255,255,255,0.6)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff color="#FF69B4" size={20} /> : <Eye color="#FF69B4" size={20} />}</TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#FF69B4" size={16} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirm your password" placeholderTextColor="rgba(255,255,255,0.6)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff color="#FF69B4" size={20} /> : <Eye color="#FF69B4" size={20} />}</TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <Switch value={agreeToTerms} onValueChange={setAgreeToTerms} trackColor={{ false: "#767577", true: "#FF69B4" }} thumbColor={"#f4f3f4"} />
            <Text style={styles.checkboxLabel}>I agree to the <Text style={styles.link} onPress={() => navigation.navigate('TermsOfService')}>Terms of Service</Text></Text>
          </View>
          <View style={styles.checkboxContainer}>
            <Switch value={agreeToPrivacy} onValueChange={setAgreeToPrivacy} trackColor={{ false: "#767577", true: "#FF69B4" }} thumbColor={"#f4f3f4"} />
            <Text style={styles.checkboxLabel}>I agree to the <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text></Text>
          </View>

          <TouchableOpacity style={[styles.button, !isFormValid && styles.disabledButton]} onPress={handleSubmit} disabled={!isFormValid}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  formContainer: { width: '100%', maxWidth: 400, padding: 24, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,105,180,0.6)' },
  logo: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#FF1493', textShadowColor: 'rgba(255, 20, 147, 0.5)', textShadowRadius: 20 },
  logoUnderline: { width: 64, height: 4, borderRadius: 2, backgroundColor: '#FF69B4', alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  eyeIcon: { position: 'absolute', right: 12, zIndex: 1 },
  input: { flex: 1, height: 50, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,105,180,0.5)', paddingLeft: 40, paddingRight: 40, color: 'white' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  checkboxLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 8, flexShrink: 1 },
  link: { color: '#FF69B4', textDecorationLine: 'underline' },
  button: { height: 50, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderWidth: 2, borderColor: 'rgba(255,105,180,0.5)', marginTop: 8 },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
