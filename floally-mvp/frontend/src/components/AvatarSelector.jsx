import { useState } from 'react';

function AvatarSelector({ currentAvatar, onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('defaults');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Default avatar options
  const defaultAvatars = [
    { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', name: 'Felix' },
    { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', name: 'Aneka' },
    { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', name: 'Luna' },
    { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', name: 'Max' },
    { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', name: 'Sam' },
    { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley', name: 'Riley' },
    { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1', name: 'Robot' },
    { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah', name: 'Sarah' },
    { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alex', name: 'Alex' },
    { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Jordan', name: 'Jordan' },
    { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Taylor', name: 'Taylor' },
    { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy', name: 'Happy' },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setSelectedAvatar(reader.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <h3 className="text-xl font-bold text-gray-900">Choose Your Avatar</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('defaults')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'defaults'
                  ? 'bg-white text-teal-600 border-t-2 border-teal-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🎨 Default Avatars
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-teal-600 border-t-2 border-teal-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📤 Upload Custom
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'defaults' && (
            <div className="grid grid-cols-4 gap-4">
              {defaultAvatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedAvatar === avatar.url
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <p className="text-xs text-gray-600 text-center">{avatar.name}</p>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  {uploadedImage || selectedAvatar ? (
                    <img
                      src={uploadedImage || selectedAvatar}
                      alt="Preview"
                      className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-teal-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gray-100 flex items-center justify-center text-4xl">
                      📷
                    </div>
                  )}
                </div>

                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 cursor-pointer inline-block transition-colors">
                    {uploading ? 'Uploading...' : uploadedImage ? 'Change Image' : 'Choose Image'}
                  </span>
                </label>

                <p className="text-sm text-gray-500 mt-4">
                  Upload a square image for best results (max 5MB)
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Guidelines:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Use a clear, professional photo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Square images work best (1:1 ratio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Recommended size: 400x400 pixels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>JPG, PNG, or WebP format</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedAvatar}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarSelector;
