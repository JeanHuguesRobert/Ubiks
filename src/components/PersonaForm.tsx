import { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { PersonaFormData, personaTones, personaStyles, personaVoices, SocialPlatformSettings } from '../types/Persona';

interface PersonaFormProps {
  initialData: PersonaFormData;
  onSubmit: (data: PersonaFormData) => void;
  isSubmitting: boolean;
  submitButtonText: string;
}

const PersonaForm = ({ initialData, onSubmit, isSubmitting, submitButtonText }: PersonaFormProps) => {
  const [formData, setFormData] = useState<PersonaFormData>(initialData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'style' | 'platforms'>('basic');

  // Update form data when initialData changes (e.g., when loading existing persona)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Persona name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.map(platform => 
        platform.platformId === platformId 
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-gray-100">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'basic'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'style'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Style & Tone
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'platforms'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Platforms
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Persona Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="e.g., Professional Sarah, Casual Mike"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              <p className="mt-1 text-xs text-gray-500">Give your persona a distinctive name to easily identify it.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe this persona's purpose and personality..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide details about this persona's background, target audience, and goals.
              </p>
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
                Avatar URL
              </label>
              <input
                type="text"
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Optional: Provide a URL to an image for this persona.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Link 
              to="/personas"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next: Style & Tone
            </button>
          </div>
        </div>

        {/* Style & Tone Tab */}
        <div className={activeTab === 'style' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                Tone
              </label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {personaTones.map((tone) => (
                  <option key={tone.value} value={tone.value}>
                    {tone.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                How this persona sounds in terms of formality and feeling.
              </p>
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700">
                Writing Style
              </label>
              <select
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {personaStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The approach this persona takes when communicating.
              </p>
            </div>

            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700">
                Voice
              </label>
              <select
                id="voice"
                name="voice"
                value={formData.voice}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {personaVoices.map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The perspective from which this persona speaks.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('platforms')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next: Platforms
            </button>
          </div>
        </div>

        {/* Platforms Tab */}
        <div className={activeTab === 'platforms' ? 'block' : 'hidden'}>
          <p className="text-sm text-gray-600 mb-4">
            Select the platforms this persona will post to. You can change these settings later.
          </p>

          <div className="space-y-4">
            {formData.platforms.map((platform: SocialPlatformSettings) => (
              <div key={platform.platformId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <span className="font-medium">{platform.platformName}</span>
                  {platform.maxLength && (
                    <span className="ml-2 text-xs text-gray-500">
                      Max {platform.maxLength} characters
                    </span>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={platform.enabled}
                    onChange={() => handlePlatformToggle(platform.platformId)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonaForm;
