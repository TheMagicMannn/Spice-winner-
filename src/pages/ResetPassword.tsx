import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Spinner';

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>;

export const ResetPasswordPage: React.FC = () => {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await updateUserPassword(password);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Your password has been reset successfully. Please log in.", variant: "success" });
      navigate('/login');
    }
    setIsLoading(false);
  };
  
  const isFormValid = password && confirmPassword && password === confirmPassword && !isLoading;

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
            <h2 className="text-xl font-semibold mb-2 text-white">Reset Password</h2>
            <p className="text-sm text-text-secondary">Enter a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2"><Label htmlFor="password">New Password</Label>
              <div className="relative">
                <LockIcon />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your new password" required className="pl-10 pr-10" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-brand-secondary hover:text-brand-primary flex items-center justify-center">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
            </div>
            
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <LockIcon />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" required className="pl-10 pr-10" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-brand-secondary hover:text-brand-primary flex items-center justify-center">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
            </div>

            <button type="submit" disabled={!isFormValid} className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-2 border-brand-primary/50 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  <span className="ml-2">Resetting Password...</span>
                </span>
              ) : (
                "Set New Password"
              )}
            </button>

            <div className="text-center pt-2">
                <button type="button" className="p-0 h-auto text-sm text-brand-secondary hover:text-brand-primary" onClick={() => navigate('/login')}>
                    Back to Login
                </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`.animate-glow { animation: glow 2.4s ease-in-out infinite; } @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(255, 20, 147, 0.5); border-color: rgba(255, 20, 147, 0.5); } 50% { box-shadow: 0 0 16px rgba(255, 20, 147, 1); border-color: rgba(255, 20, 147, 1); } }`}</style>
    </div>
  );
};