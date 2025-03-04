import { useState, useEffect } from 'react';
import { usePersona } from '../contexts/PersonaContext';
import { Check, CircleAlert, Trash2 } from 'lucide-react';
import { PersonaFormData } from '../types/Persona';

/**
 * This component is only for testing and validating persona management functionality
 * It should be removed in production
 */
const PersonaTestPanel = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [testResults, setTestResults] = useState<{
    create: boolean | null;
    read: boolean | null;
    update: boolean | null;
    delete: boolean | null;
    persistence: boolean | null;
  }>({
    create: null,
    read: null,
    update: null,
    delete: null,
    persistence: null
  });
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { 
    personas, 
    createPersona, 
    getPersona, 
    updatePersona, 
    deletePersona 
  } = usePersona();

  // Test function to validate persona CRUD operations
  const runTests = async () => {
    setIsRunning(true);
    setTestResults({
      create: null,
      read: null,
      update: null,
      delete: null,
      persistence: null
    });
    setTestLog([]);

    try {
      // Generate a unique test persona name
      const testId = new Date().getTime();
      const testName = `Test Persona ${testId}`;
      
      // Log test start
      addLog(`Starting persona management tests with "${testName}"...`);

      // Test CREATE
      addLog("Testing CREATE functionality...");
      const personaData: PersonaFormData = {
        name: testName,
        description: "Test description",
        tone: "casual",
        style: "conversational",
        voice: "first-person",
        platforms: [
          {
            platformId: "twitter",
            platformName: "Twitter",
            enabled: true,
            maxLength: 280,
            supportsTags: true,
            supportsImages: true,
            supportsVideos: true
          }
        ]
      };

      const createdPersona = await createPersona(personaData);
      
      if (createdPersona && createdPersona.id) {
        setTestResults(prev => ({ ...prev, create: true }));
        addLog(`✅ CREATE test passed: Created persona with ID ${createdPersona.id}`);
        
        // Test READ
        addLog("Testing READ functionality...");
        const retrievedPersona = getPersona(createdPersona.id);
        
        if (retrievedPersona && retrievedPersona.name === testName) {
          setTestResults(prev => ({ ...prev, read: true }));
          addLog("✅ READ test passed: Successfully retrieved persona");
          
          // Test UPDATE
          addLog("Testing UPDATE functionality...");
          const updatedDescription = "Updated test description";
          const updatedData = {
            ...personaData,
            description: updatedDescription
          };
          
          const updatedPersona = await updatePersona(createdPersona.id, updatedData);
          
          if (updatedPersona && updatedPersona.description === updatedDescription) {
            setTestResults(prev => ({ ...prev, update: true }));
            addLog("✅ UPDATE test passed: Successfully updated persona");
            
            // Test persistence by checking if the persona exists
            addLog("Testing PERSISTENCE functionality...");
            const persistedPersona = getPersona(createdPersona.id);
            
            if (persistedPersona && persistedPersona.description === updatedDescription) {
              setTestResults(prev => ({ ...prev, persistence: true }));
              addLog("✅ PERSISTENCE test passed: Data persisted correctly");
            } else {
              setTestResults(prev => ({ ...prev, persistence: false }));
              addLog("❌ PERSISTENCE test failed: Data was not persisted correctly");
            }
            
            // Test DELETE
            addLog("Testing DELETE functionality...");
            await deletePersona(createdPersona.id);
            
            // Check if persona is deleted
            const deletedPersona = getPersona(createdPersona.id);
            
            if (!deletedPersona) {
              setTestResults(prev => ({ ...prev, delete: true }));
              addLog("✅ DELETE test passed: Successfully deleted persona");
            } else {
              setTestResults(prev => ({ ...prev, delete: false }));
              addLog("❌ DELETE test failed: Persona still exists after deletion");
            }
          } else {
            setTestResults(prev => ({ ...prev, update: false }));
            addLog("❌ UPDATE test failed: Could not update persona");
          }
        } else {
          setTestResults(prev => ({ ...prev, read: false }));
          addLog("❌ READ test failed: Could not retrieve persona");
        }
      } else {
        setTestResults(prev => ({ ...prev, create: false }));
        addLog("❌ CREATE test failed: Could not create persona");
      }

      addLog("Test run completed.");
    } catch (error) {
      addLog(`Error during tests: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const addLog = (message: string) => {
    setTestLog(prev => [...prev, message]);
  };

  if (!showPanel) {
    return (
      <button 
        onClick={() => setShowPanel(true)}
        className="fixed bottom-20 right-5 bg-blue-700 text-white p-2 rounded-md text-xs z-40"
      >
        Test Personas
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg p-4 border border-gray-200 text-sm w-96 z-40 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Persona Management Tests</h3>
        <button 
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          This panel validates that users can create, edit, and delete personas with proper data persistence.
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Current Personas:</span>
          <span className="text-gray-600">{personas.length}</span>
        </div>

        <div className="space-y-2 mt-4">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex items-center justify-between">
              <span className="capitalize">{test} Test:</span>
              {result === null ? (
                <span className="text-gray-400">Not run</span>
              ) : result ? (
                <span className="text-green-600 flex items-center">
                  <Check size={16} className="mr-1" /> Passed
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <CircleAlert size={16} className="mr-1" /> Failed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border p-2 rounded bg-gray-50 mb-4 h-40 overflow-y-auto text-xs font-mono">
        {testLog.length > 0 ? (
          testLog.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">Test log will appear here...</div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
        >
          {isRunning ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Running...
            </>
          ) : (
            'Run Tests'
          )}
        </button>
        
        <button
          onClick={() => {
            setTestResults({
              create: null,
              read: null,
              update: null,
              delete: null,
              persistence: null
            });
            setTestLog([]);
          }}
          className="py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default PersonaTestPanel;
