import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Checkbox } from "../components/Checkbox";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Spinner } from "../components/Spinner";
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>;


export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    
    if (!agreeToTerms || !agreeToPrivacy) {
      toast({ title: "Error", description: "Please agree to the terms and privacy policy", variant: "destructive" });
      return;
    }

    if (parseInt(age) < 18) {
      toast({ title: "Error", description: "You must be 18 or older to sign up", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(email, password, name, age);
    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Check your email for a confirmation link.", variant: "success" });
      // The useAuth hook will automatically navigate the user to the profile setup page on successful login after confirmation.
    }
    setLoading(false);
  };

  const isFormValid = email && password && confirmPassword && name && age && 
                     password.length >= 6 && password === confirmPassword && 
                     agreeToTerms && agreeToPrivacy && !loading;

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
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
            <h2 className="text-xl font-semibold mb-2 text-white">Create Account</h2>
            <p className="text-sm text-text-secondary">Join the premium lifestyle community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><div className="relative"><UserIcon /><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required className="pl-10" /></div></div>
            <div className="space-y-2"><Label htmlFor="age">Age (18+)</Label><div className="relative"><CalendarIcon /><Input id="age" type="number" min="18" max="99" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" required className="pl-10" /></div></div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><div className="relative"><MailIcon /><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="pl-10" /></div></div>
            
            <div className="space-y-2"><Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockIcon />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min. 6 characters)" required className="pl-10 pr-10" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-brand-secondary hover:text-brand-primary flex items-center justify-center">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
            </div>
            
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <LockIcon />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className="pl-10 pr-10" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-brand-secondary hover:text-brand-primary flex items-center justify-center">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3"><Checkbox id="terms" checked={agreeToTerms} onCheckedChange={setAgreeToTerms} /><Label htmlFor="terms" className="text-sm text-text-secondary leading-5 mb-0">I agree to the <span className="text-brand-secondary">Terms of Service</span> and understand this is an adults-only platform</Label></div>
              <div className="flex items-start space-x-3"><Checkbox id="privacy" checked={agreeToPrivacy} onCheckedChange={setAgreeToPrivacy} /><Label htmlFor="privacy" className="text-sm text-text-secondary leading-5 mb-0">I agree to the <span className="text-brand-secondary">Privacy Policy</span> and consent to data processing</Label></div>
            </div>

            <button type="submit" disabled={!isFormValid} className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-2 border-brand-primary/50 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {loading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  <span className="ml-2">Creating Account...</span>
                </span>
              ) : (
                "Create Account"
              )}
            </button>
            
            <div className="relative pt-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-primary/30" /></div><div className="relative flex justify-center text-sm"><span className="bg-black/70 px-4 text-text-secondary">Or</span></div></div>
            
            <div className="text-center">
              <span className="text-sm text-text-secondary">Already have an account? </span>
              <button type="button" className="p-0 h-auto text-sm text-brand-secondary hover:text-brand-primary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-brand-primary/30 text-center">
            <p className="text-xs text-brand-secondary mb-2"><span role="img" aria-label="lock">🔒</span> <strong>Adults Only Platform</strong></p>
            <p className="text-xs text-text-secondary">Premium lifestyle community for 18+ verified members only.</p>
          </div>
        </div>
      </div>
      <style>{`.animate-glow { animation: glow 2.4s ease-in-out infinite; } @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(255, 20, 147, 0.5); border-color: rgba(255, 20, 147, 0.5); } 50% { box-shadow: 0 0 16px rgba(255, 20, 147, 1); border-color: rgba(255, 20, 147, 1); } }`}</style>
    </div>
  );
}