import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Persona, personaTones, personaStyles, personaVoices } from '../types/Persona';

interface Props {
  persona: Persona;
  onChange: (field: string, value: any) => void;
}

const ToneStyleSettings: React.FC<Props> = ({ persona, onChange }) => {
  const [sampleText, setSampleText] = useState<string>(
    "We're excited to announce our new product launch next week. It's been a long journey, and we can't wait to share it with you all!"
  );

  const getToneDescription = (tone?: string): string => {
    if( !tone ) return "No description available.";
    const descriptions: Record<string, string> = {
      casual: "Relaxed and conversational, like talking to a friend.",
      professional: "Polished and business-appropriate, maintaining credibility.",
      friendly: "Warm and approachable, making the audience feel welcome.",
      formal: "Traditional and proper, suitable for official communications.",
      witty: "Clever and humorous, with wordplay and intelligent humor.",
      humorous: "Fun and amusing, focused on entertainment value.",
      authoritative: "Confident and definitive, establishing expertise and trust."
    };
    return descriptions[tone] || "No description available.";
  };

  const getStyleDescription = (style?: string): string => {
    if( !style ) return "No description available.";
    const descriptions: Record<string, string> = {
      conversational: "Natural dialogue that engages the reader directly.",
      informative: "Focused on providing useful information and facts.",
      persuasive: "Designed to convince the audience of a viewpoint.",
      storytelling: "Narrative approach that creates emotional connection.",
      inspirational: "Uplifting content that motivates the audience.",
      educational: "Teaching-focused content that explains concepts clearly.",
      promotional: "Marketing-oriented content highlighting benefits."
    };
    return descriptions[style] || "No description available.";
  };

  const getVoiceDescription = (voice?: string): string => {
    if( !voice ) return "No description available.";
    const descriptions: Record<string, string> = {
      "first-person": "Speaking as 'I' or 'we', creating personal connection.",
      "second-person": "Addressing the reader as 'you', making it about them.",
      "third-person": "Using 'they', 'it', or names, for more objective content.",
      "brand-voice": "Speaking as the brand entity, maintaining brand identity."
    };
    return descriptions[voice] || "No description available.";
  };

  const getPreviewText = (): string => {
    let preview = sampleText;
    
    // Apply tone modifications
    switch (persona.tone) {
      case 'casual':
        preview = preview.replace("We're excited", "We're super stoked").replace("can't wait", "can't wait");
        break;
      case 'professional':
        preview = preview.replace("We're excited", "We are pleased").replace("can't wait", "look forward");
        break;
      case 'formal':
        preview = preview.replace("We're excited", "We are delighted").replace("It's been", "It has been").replace("can't wait", "eagerly anticipate");
        break;
      case 'witty':
        preview = preview.replace("We're excited", "Hold onto your hats! We're thrilled").replace("can't wait", "are counting the milliseconds");
        break;
      // Add more tone transformations as needed
    }
    
    // Apply style modifications
    switch (persona.style) {
      case 'storytelling':
        preview = `The journey began months ago, with just an idea. Now, ${preview.toLowerCase()}`;
        break;
      case 'persuasive':
        preview = `${preview} You won't want to miss this opportunity to be among the first to experience it.`;
        break;
      // Add more style transformations as needed
    }
    
    // Apply voice modifications
    switch (persona.voice) {
      case 'first-person':
        // Already in first person in the sample
        break;
      case 'second-person':
        preview = preview.replace("We're", "You're invited to our").replace("we can't wait", "we can't wait for you");
        break;
      case 'third-person':
        preview = preview.replace("We're", "The company is").replace("we can't wait", "they can't wait");
        break;
      case 'brand-voice':
        preview = preview.replace("We're", "Ubikial is").replace("we can't wait", "the team can't wait");
        break;
    }
    
    return preview;
  };

  // When handling platforms, treat them as an array
  const platformsArray = Array.isArray(persona.platforms) 
    ? persona.platforms 
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Tone & Style Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure how your persona sounds and communicates across platforms.
        </p>
      </div>

      {/* Tone Selection */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-md font-medium text-gray-900">Tone of Voice</h4>
            <p className="text-sm text-gray-500">How formal or casual your persona will sound</p>
          </div>
          <div className="w-64">
            <select
              value={persona.tone}
              onChange={(e) => onChange('tone', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {personaTones.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {getToneDescription(persona.tone)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mt-4">
          {personaTones.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => onChange('tone', tone.value)}
              className={`relative rounded-lg border p-4 h-20 flex items-center justify-center text-sm transition-all ${
                persona.tone === tone.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="block text-center">{tone.label}</span>
              {persona.tone === tone.value && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-md font-medium text-gray-900">Content Style</h4>
            <p className="text-sm text-gray-500">The approach this persona takes when communicating</p>
          </div>
          <div className="w-64">
            <select
              value={persona.style}
              onChange={(e) => onChange('style', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {personaStyles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {getStyleDescription(persona.style)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {personaStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange('style', style.value)}
              className={`relative rounded-lg border p-3 flex flex-col items-center transition-all ${
                persona.style === style.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium">{style.label}</span>
              <span className="text-xs mt-1 text-center text-current opacity-70">
                {getStyleDescription(style.value).split('.')[0]}
              </span>
              {persona.style === style.value && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-md font-medium text-gray-900">Narrative Voice</h4>
            <p className="text-sm text-gray-500">The perspective from which this persona speaks</p>
          </div>
          <div className="w-64">
            <select
              value={persona.voice}
              onChange={(e) => onChange('voice', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {personaVoices.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {getVoiceDescription(persona.voice)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {personaVoices.map((voice) => (
            <button
              key={voice.value}
              type="button"
              onClick={() => onChange('voice', voice.value)}
              className={`relative rounded-lg border p-3 flex flex-col items-center transition-all ${
                persona.voice === voice.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium">{voice.label}</span>
              <span className="text-xs mt-1 text-center text-current opacity-70">
                {getVoiceDescription(voice.value).split('.')[0]}
              </span>
              {persona.voice === voice.value && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Preview</h4>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-gray-800 mb-4">{getPreviewText()}</p>
          
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 flex items-center">
            <CircleAlert className="h-3 w-3 mr-1" />
            This is a simple approximation. AI-powered adaptation will be more natural.
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="sample-text" className="block text-sm font-medium text-gray-700 mb-1">
            Sample Text
          </label>
          <textarea
            id="sample-text"
            rows={2}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter text to see how it would sound with this persona"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ToneStyleSettings;
