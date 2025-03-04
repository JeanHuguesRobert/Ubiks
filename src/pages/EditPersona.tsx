import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { usePersona } from '../contexts/PersonaContext';
import PersonaForm from '../components/PersonaForm';
import { PersonaFormData, emptyPersonaForm } from '../types/Persona';
import { CircleAlert } from 'lucide-react';

const EditPersona = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { getPersona, updatePersona, loading } = usePersona();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<PersonaFormData>(emptyPersonaForm);

  useEffect(() => {
    if (id) {
      const persona = getPersona(id);
      if (persona) {
        setInitialData({
          name: persona.name,
          description: persona.description,
          tone: persona.tone,
          style: persona.style,
          voice: persona.voice,
          avatarUrl: persona.avatarUrl,
          platforms: persona.platforms
        });
      } else {
        setNotFound(true);
      }
    }
  }, [id, getPersona]);

  const handleSubmit = async (formData: PersonaFormData) => {
    if (!id) return;
    
    try {
      setError(null);
      await updatePersona(id, formData);
      navigate('/personas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the persona');
    }
  };

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Persona Not Found</h1>
          <p className="text-gray-600 mb-6">The persona you are trying to edit does not exist.</p>
          <button
            onClick={() => navigate('/personas')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back to Personas
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Persona</h1>
        <p className="text-gray-600 mt-1">Update your social media personality</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <PersonaForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        submitButtonText="Update Persona"
      />
    </DashboardLayout>
  );
};

export default EditPersona;
