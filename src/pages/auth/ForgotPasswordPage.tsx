import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { colors, spacing, typography } from '../../styles/common';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordNavigationProp;
}

export const ForgotPasswordPage: React.FC<Props> = ({ navigation }) => {
  const { sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await sendPasswordResetEmail(email);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    } else {
      setIsSuccess(true);
      toast({
        title: 'Email Sent',
        description: 'Check your email for password reset instructions',
        variant: 'success',
      });
    }
    setIsLoading(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base100 }}
      contentContainerStyle={{ flexGrow: 1, padding: spacing.lg }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{
          fontSize: typography.xxl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.md,
          textAlign: 'center',
        }}>
          Reset Password
        </Text>
        
        <Text style={{
          fontSize: typography.sm,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          icon="mail"
        />

        <Button
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={!email || isSuccess}
          style={{ marginTop: spacing.lg }}
        >
          {isSuccess ? 'Email Sent' : 'Send Reset Email'}
        </Button>

        {isSuccess && (
          <View style={{
            backgroundColor: colors.base200,
            padding: spacing.md,
            borderRadius: 8,
            marginTop: spacing.lg,
          }}>
            <Text style={{
              color: colors.textSecondary,
              fontSize: typography.sm,
              textAlign: 'center',
            }}>
              If an account exists with this email, you'll receive password reset instructions shortly.
            </Text>
          </View>
        )}

        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
            Remember your password?{' '}
          </Text>
          <Text
            style={{ color: colors.brandPrimary, fontSize: typography.sm, fontWeight: '600' }}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};