'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Trophy } from 'lucide-react';
import axios from 'axios';

interface ProfileData {
  username: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  bio?: string | null;
  member_since?: string;
}

interface StatsData {
  total_transactions: number;
  goals_achieved: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

    // Fetch profile data
    axios
      .get('http://localhost:8000/api/accounts/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });

    // Fetch stats data
    axios
      .get('http://localhost:8000/api/core/stats/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        // silently fail stats
      });
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [e.target.id]: e.target.value,
    });
  };

  const handleSave = () => {
    if (!profile || !token) return;

    setSaving(true);
    setError(null);

    axios
      .put('http://localhost:8000/api/accounts/profile/', profile, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSaving(false);
        alert('Profile updated successfully!');
      })
      .catch(() => {
        setSaving(false);
        setError('Failed to update profile');
      });
  };

  const handleDeleteAccount = () => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    setDeleting(true);
    setError(null);

    axios
      .delete('http://localhost:8000/api/accounts/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setDeleting(false);
        alert('Account deleted successfully!');
        window.location.href = '/login';
      })
      .catch(() => {
        setDeleting(false);
        setError('Failed to delete account');
      });
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-700">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-2 bg-gray-200 rounded-md p-1">
            {['personal', 'account'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button p-2 rounded-md font-medium text-sm transition-colors text-gray-500 hover:text-purple-700 
                  ${activeTab === tab ? 'bg-white shadow text-purple-700' : ''}`}
              >
                {tab === 'personal' ? 'Personal' : 'Account'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div id="tab-content-container" className="space-y-6">
            {activeTab === 'personal' && (
              <div className="tab-content rounded-xl border border-gray-200 bg-white shadow-lg p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Personal Information</h3>
                  <p className="text-gray-500 text-sm mt-1">Update your personal details and profile information.</p>
                </div>

                <hr className="border-t border-gray-200" />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={profile.address || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      if (profile) {
                        setLoading(true);
                        axios
                          .get('http://localhost:8000/api/accounts/profile/', {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          .then((res) => {
                            setProfile(res.data);
                            setLoading(false);
                          })
                          .catch(() => {
                            setError('Failed to reload profile');
                            setLoading(false);
                          });
                      }
                    }}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-md text-white ${
                      saving ? 'bg-gray-400' : 'bg-purple-700 hover:bg-purple-800'
                    } text-sm font-medium`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="tab-content rounded-xl border border-gray-200 bg-white shadow-lg p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Account Information</h3>
                  <p className="text-gray-500 text-sm mt-1">View your account statistics.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Member Since</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {profile.member_since ? new Date(profile.member_since).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Total Transactions</span>
                    </div>
                    <p className="text-2xl font-bold">{stats?.total_transactions ?? 0}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Goals Achieved</span>
                    </div>
                    <p className="text-2xl font-bold">{stats?.goals_achieved ?? 0}</p>
                  </div>
                </div>

                <hr className="border-t border-gray-200" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-base font-medium text-red-600">Danger Zone</h4>
                      <p className="text-sm text-gray-500">This action is permanent and cannot be undone.</p>
                    </div>
                    <button
                      disabled={deleting}
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50 text-sm font-medium"
                    >
                      {deleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
