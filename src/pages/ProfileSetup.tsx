import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // ✅ Import Supabase client
import Button from '../components/Button'; // adjust path if needed

const ProfileSetup = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [accountType, setAccountType] = useState<'individual' | 'couple'>('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Progress bar percentage
  const progress = useMemo(() => (step === 0 ? 0 : (step / 4) * 100), [step]);

  // ✅ Handle submit function
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Check user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('You must be logged in to complete your profile.');

      // 2️⃣ Validate photo uploads
      if (photoFiles.length < 2) {
        throw new Error('Please upload at least 2 photos before completing your profile.');
      }

      // 3️⃣ Upload photos to Supabase storage
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `profiles/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile_media')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('profile_media')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 4️⃣ Build profile payload
      const payload = {
        display_name: formData.displayName?.trim() || null,
        display_name2: formData.displayName2?.trim() || null,
        gender: formData.gender || null,
        gender2: formData.gender2 || null,
        orientation: formData.orientation || null,
        orientation2: formData.orientation2 || null,
        age: formData.age ? Number(formData.age) : null,
        age2: formData.age2 ? Number(formData.age2) : null,
        location: formData.location?.trim() || null,
        relationship_status: formData.relationshipStatus || null,
        seeking: formData.seeking || [],
        seeking_relationship_type: formData.seekingRelationshipType || [],
        lifestyle_experience: formData.lifestyleExperience || null,
        kinks: formData.kinks || [],
        interests: formData.interests || [],
        soft_limits: formData.softLimits || [],
        hard_limits: formData.hardLimits || [],
        safety_practices: formData.safetyPractices || null,
        rules: formData.rules || null,
        bio: formData.bio || null,
        photos: uploadedUrls,
        membership_tier: formData.membershipTier || 'basic',
        profile_type: accountType === 'couple' ? 'couple' : 'individual',
        match_preferences: formData.matchPreferences || {},
        vip: formData.membershipTier === 'vip',
        updated_at: new Date().toISOString(),
      };

      // 5️⃣ Upsert profile row
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', user.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, ...payload });
        if (insertError) throw insertError;
      }

      // 6️⃣ Write audit log
      const { error: logError } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'complete_profile',
        description: `${payload.profile_type} profile setup completed.`,
      });
      if (logError) console.warn('Audit log failed:', logError.message);

      // 7️⃣ Done
      alert('🎉 Profile completed successfully!');
      navigate('/home'); // adjust route

    } catch (err: any) {
      console.error('[Profile Setup Error]', err);
      setError(err.message || 'Failed to complete profile setup.');
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Render content (simplified)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {accountType === 'couple' ? 'Complete Our Profile 💞' : 'Complete My Profile 🎉'}
      </h1>

      <p className="text-center text-gray-400 text-sm mb-2">
        You can upgrade anytime in Settings.
      </p>

      {error && (
        <p className="text-red-400 text-sm text-center py-2">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        isLoading={loading}
        className="w-full mt-4"
      >
        {loading ? 'Saving...' : `Complete ${accountType === 'couple' ? 'Our' : 'My'} Profile 🎉`}
      </Button>

      <div className="w-full bg-gray-700 rounded-full h-2 mt-8">
        <div
          className="bg-pink-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileSetup;
