import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Spinner';

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await sendPasswordResetEmail(email);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMessageSent(true);
      toast({ title: "Success", description: "Password reset link has been sent to your email.", variant: "success" });
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)',
          filter: 'blur(2px)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto p-8 bg-black/70 rounded-2xl border-2 border-brand-primary/60 shadow-lg shadow-brand-primary/20 backdrop-blur-sm animate-fade-in">
          <div className="text-center mb-8">
             <h1 
              className="text-4xl font-bold mb-3"
              style={{ 
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
              }}
            >
              SPICE
            </h1>
            <div 
              className="w-16 h-1 mx-auto rounded-full mb-4"
              style={{
                background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
              }}
            />
            <h2 className="text-xl font-semibold mb-2 text-white">Forgot Password</h2>
            <p className="text-sm text-text-secondary">Enter your email to receive a reset link</p>
          </div>

          {messageSent ? (
            <div className="text-center">
              <div className="p-4 bg-green-900/50 border border-green-500/50 rounded-lg mb-6">
                <p className="text-green-100">A password reset link has been sent to your email address. Please check your inbox (and spam folder).</p>
              </div>
               <button type="button" className="p-0 h-auto text-sm text-brand-secondary hover:text-brand-primary" onClick={() => navigate('/login')}>
                    Back to Login
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
                <div className="relative">
                  <MailIcon />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 bg-black/50 border-brand-primary/50 text-white placeholder:text-white/60 focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading || !email} className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-2 border-brand-primary/50 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner />
                    <span className="ml-2">Sending Link...</span>
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
              
              <div className="text-center">
                <button type="button" className="p-0 h-auto text-sm text-brand-secondary hover:text-brand-primary" onClick={() => navigate('/login')}>
                    Back to Login
                </button>
              </div>
            </form>
          )}
          <div className="mt-8 pt-6 border-t border-brand-primary/30 text-center">
              <p className="text-xs text-brand-secondary mb-2">
                <span role="img" aria-label="lock">🔒</span> <strong>Adults Only Platform</strong>
              </p>
              <p className="text-xs text-text-secondary">
                Your privacy and discretion are our top priorities.
              </p>
            </div>
        </div>
      </div>
      <style>{`.animate-glow { animation: glow 2.4s ease-in-out infinite; } @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(255, 20, 147, 0.5); border-color: rgba(255, 20, 147, 0.5); } 50% { box-shadow: 0 0 16px rgba(255, 20, 147, 1); border-color: rgba(255, 20, 147, 1); } }`}</style>
    </div>
  );
};