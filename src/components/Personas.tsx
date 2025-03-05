import React from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../contexts/PersonaContext';
import { PlusCircle } from 'lucide-react';
import { SocialPlatformSettings } from '../types/Persona';

const Personas = () => {
  const { personas, loading, error } = usePersona();

  // Debug the data structure
  console.log('Personas data:', personas);

  const renderPlatformBadges = (platforms: SocialPlatformSettings[]) => {
    if (!Array.isArray(platforms)) {
      console.warn('Platforms is not an array:', platforms);
      return null;
    }

    return platforms
      .filter(platform => platform.enabled)
      .map((platform) => (
        <span 
          key={platform.platformId}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
        >
          {platform.platformName}
        </span>
      ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Personas</h1>
        <Link
          to="/personas/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Persona
        </Link>
      </div>

      {personas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">No Personas Found</h2>
          <p className="text-gray-600 mb-6">You haven't created any personas yet.</p>
          <Link
            to="/personas/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Persona
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map(persona => (
            <div key={persona.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{persona.name}</h3>
              <p className="text-gray-600 mb-4">{persona.description}</p>
              <div className="flex flex-wrap gap-2">
                {renderPlatformBadges(persona.platforms)}
              </div>
              <Link
                to={`/personas/${persona.id}/settings`}
                className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Configure
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Personas;