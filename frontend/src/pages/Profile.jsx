import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '', country: '' }
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated successfully');
      // AuthContext me trigger re-fetch or reload
      window.location.reload(); 
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', passwordForm);
      toast.success('Password updated successfully');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-6 border-b border-border pb-2">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface p-6 border border-border">
          <h2 className="text-sm font-semibold text-textMain mb-4 border-b border-border pb-2 uppercase tracking-wider">Account & address</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Name</label>
              <input required type="text" className="input-field" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input required type="email" className="input-field" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
            </div>
            
            <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted mt-6 mb-2 border-b border-border pb-1">Address</h3>
            <div>
              <label className="block text-sm font-bold mb-1">Street</label>
              <input type="text" className="input-field" value={profileForm.address.street} onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, street: e.target.value}})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">City</label>
                <input type="text" className="input-field" value={profileForm.address.city} onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, city: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">State</label>
                <input type="text" className="input-field" value={profileForm.address.state} onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, state: e.target.value}})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Zip Code</label>
                <input type="text" className="input-field" value={profileForm.address.zipCode} onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, zipCode: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Country</label>
                <input type="text" className="input-field" value={profileForm.address.country} onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, country: e.target.value}})} />
              </div>
            </div>
            
            <button type="submit" className="btn-secondary w-full mt-4">Save Profile</button>
          </form>
        </div>

        {/* Password Update */}
        <div className="bg-surface p-6 border border-border h-fit">
          <h2 className="text-sm font-semibold text-textMain mb-4 border-b border-border pb-2 uppercase tracking-wider">Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Current Password</label>
              <input required type="password" className="input-field" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">New Password</label>
              <input required type="password" className="input-field" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
            </div>
            <button type="submit" className="btn-secondary w-full mt-4">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
