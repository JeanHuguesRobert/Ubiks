import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { usePersona } from '../contexts/PersonaContext';
import PersonaForm from '../components/PersonaForm';
import { PersonaFormData, emptyPersonaForm } from '../types/Persona';
import { CircleAlert } from 'lucide-react';

const CreatePersona = () => {
  const [error, setError] = useState<string | null>(null);
  const { createPersona, loading } = usePersona();
  const navigate = useNavigate();

  const handleSubmit = async (formData: PersonaFormData) => {
    try {
      setError(null);
      await createPersona(formData);
      navigate('/personas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the persona');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Persona</h1>
        <p className="text-gray-600 mt-1">Define a new social media personality</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <PersonaForm 
        initialData={emptyPersonaForm}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        submitButtonText="Create Persona"
      />
    </DashboardLayout>
  );
};

export default CreatePersona;
