import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/auth/AuthServices';
import { updateUserProfile, uploadProfileImage } from '../../services/profile/ProfileServices';
import { Camera, LogOut, Edit2, Save, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, userData, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nomorHP: '',
    alamat: ''
  });

  useEffect(() => {
    if (userData) {
      // Handle alamat - bisa string atau object
      let alamatValue = '';
      if (userData.alamat && userData.alamat.length > 0) {
        const firstAlamat = userData.alamat[0];
        alamatValue = typeof firstAlamat === 'string' ? firstAlamat : firstAlamat.text || '';
      }
      
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        nomorHP: userData.nomorHP || '',
        alamat: alamatValue
      });
    }
  }, [userData]);

  const handleLogout = async () => {
    const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
    if (!confirmed) return;

    const result = await logout();
    if (result.success) {
      window.location.href = '/login';
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }

    setIsUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadProfileImage(user.uid, file);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengunggah gambar' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nama: `${formData.firstName} ${formData.lastName}`,
        nomorHP: formData.nomorHP,
        alamat: formData.alamat ? [formData.alamat] : []
      };

      const result = await updateUserProfile(user.uid, updateData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Silakan login terlebih dahulu</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                  {userData?.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-110">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </label>
              </div>

              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData?.nama || 'User'}
                </h1>
                <p className="text-gray-600 mt-1">{userData?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {userData?.role || 'user'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {userData?.status || 'active'}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                    {userData?.provider || 'email'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Handle alamat - bisa string atau object
                        let alamatValue = '';
                        if (userData.alamat && userData.alamat.length > 0) {
                          const firstAlamat = userData.alamat[0];
                          alamatValue = typeof firstAlamat === 'string' ? firstAlamat : firstAlamat.text || '';
                        }
                        
                        setFormData({
                          firstName: userData.firstName || '',
                          lastName: userData.lastName || '',
                          nomorHP: userData.nomorHP || '',
                          alamat: alamatValue
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Nama Depan
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {userData?.firstName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Nama Belakang
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {userData?.lastName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                    {userData?.email || '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData?.emailVerified ? '✓ Email terverifikasi' : '✗ Email belum terverifikasi'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Nomor HP
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="nomorHP"
                      value={formData.nomorHP}
                      onChange={handleInputChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {userData?.nomorHP || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Alamat
                  </label>
                  {isEditing ? (
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Masukkan alamat lengkap"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {(() => {
                        const alamat = userData?.alamat;
                        if (!alamat || alamat.length === 0) return '-';
                        const firstAlamat = alamat[0];
                        return typeof firstAlamat === 'string' ? firstAlamat : firstAlamat.text || '-';
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Tanggal Bergabung
                  </label>
                  <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                    {formatDate(userData?.tanggalDibuat)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Tambahan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Pesanan</p>
              <p className="text-2xl font-bold text-blue-600">
                {userData?.pesanan?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Terakhir Login</p>
              <p className="text-sm font-medium text-purple-600">
                {formatDate(userData?.terakhirLogin)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Terakhir Edit</p>
              <p className="text-sm font-medium text-green-600">
                {formatDate(userData?.terakhirEdit)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;