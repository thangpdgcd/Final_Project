import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Camera, 
  Save, 
  Shield, 
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import * as profileApi from '@/api/profileApi';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      setIsLoading(true);
      const res = await profileApi.uploadAvatar(file);
      message.success(t('profile.avatarSuccess') || 'Avatar updated!');
      if (user) login('', { ...user, avatar: res.avatarUrl }); // '' means keep current token
    } catch (error) {
      message.error(t('profile.avatarError') || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const res = await profileApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      message.success(t('profile.updateSuccess') || 'Profile updated!');
      if (user) login('', { ...user, ...res.user });
      setIsEditing(false);
    } catch (error) {
      message.error(t('profile.updateError') || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] dark:bg-[#1c1716] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2a2423] rounded-[2.5rem] shadow-2xl overflow-hidden border border-amber-100/20 dark:border-white/5"
        >
          {/* Header/Cover */}
          <div className="h-48 bg-gradient-to-r from-[#4B3621] to-[#6f4e37] relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/coffee-beans.png')]"></div>
          </div>

          <div className="px-8 pb-12">
            <div className="flex flex-col md:flex-row items-end gap-8 -mt-20 mb-12">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2rem] bg-amber-50 dark:bg-zinc-800 border-8 border-white dark:border-[#2a2423] shadow-xl overflow-hidden">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4B3621] dark:text-amber-100">
                      <User size={64} />
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-3 bg-[#4B3621] text-white rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95 border-2 border-white dark:border-[#2a2423]"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="flex-1 mb-2">
                <h1 className="text-4xl font-black text-[#4B3621] dark:text-white tracking-tight mb-2">
                  {user?.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[#4B3621] dark:text-amber-200 text-xs font-black uppercase tracking-widest border border-amber-200/50">
                    {user?.roleID === '1' || user?.roleID === 1 ? 'Administrator' : 'Coffee Lover'}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-200/50 flex items-center gap-2">
                    <CheckCircle size={12} /> Verified
                  </span>
                </div>
              </div>

              <button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isLoading}
                className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all
                  ${isEditing 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600' 
                    : 'bg-[#4B3621] text-white shadow-lg shadow-[#4B3621]/30 hover:bg-[#3d2c1b]'
                  }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <Save size={18} /> : <User size={18} />)}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Info Column */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-6 flex items-center gap-3">
                    <Shield size={14} /> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-transparent focus:border-amber-200 dark:focus:border-amber-900/50 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          value={formData.email}
                          disabled={true}
                          className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-transparent py-4 pl-12 pr-4 rounded-2xl outline-none font-bold opacity-60 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="+84 000 000 000"
                          className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-transparent focus:border-amber-200 dark:focus:border-amber-900/50 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="HCM City, Vietnam"
                          className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-transparent focus:border-amber-200 dark:focus:border-amber-900/50 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-zinc-900/50 border border-amber-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B3621] dark:text-amber-200 mb-6">Membership</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-amber-500 shadow-sm">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Since</p>
                        <p className="font-bold text-sm text-[#4B3621] dark:text-white">March 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-rose-500 shadow-sm">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                        <p className="font-bold text-sm text-emerald-500">Active & Verified</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-[#4B3621] text-white overflow-hidden relative group">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                   <h4 className="relative z-10 text-[10px] font-black underline decoration-amber-400 underline-offset-8 uppercase tracking-[0.2em] mb-4">Coffee Points</h4>
                   <p className="relative z-10 text-4xl font-black mb-1">1,250 <span className="text-xs uppercase text-amber-400">PTS</span></p>
                   <p className="relative z-10 text-[10px] font-bold text-amber-200/50 uppercase tracking-widest">Gold Tier Member</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
