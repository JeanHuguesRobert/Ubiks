import React, { useState, useCallback } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { createEmptyDraft } from '../../types/Content';
import { useAuth } from '../../contexts/AuthContext';
import { PlatformPreview } from './PlatformPreview';
import { SocialPlatform } from '../../types/SocialAccount';
import { AIService } from '../../services/AIService';
import { TestHarness } from './TestHarness';
import { Navigate } from 'react-router-dom';

const platforms: SocialPlatform[] = ['twitter', 'linkedin', 'facebook', 'instagram'];

export const ContentEditor: React.FC = () => {
  const { state, dispatch } = useContent();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (!state.currentDraft) {
      dispatch({
        type: 'SET_DRAFT',
        payload: createEmptyDraft(user.id)
      });
    }

    dispatch({
      type: 'SET_DRAFT',
      payload: {
        ...state.currentDraft!,
        text,
        html: text, // For now, just use plain text
        updatedAt: new Date().toISOString()
      }
    });
  }, [state.currentDraft, dispatch, user.id]);

  const handlePreviewAdaptations = useCallback(async () => {
    if (!state.currentDraft?.text) return;

    setIsSubmitting(true);
    const aiService = new AIService({
      provider: 'mistral',
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY || ''
    });

    try {
      const adaptations = await Promise.all(
        platforms.map(async platform => {
          if (!state.currentDraft?.platformSettings[platform].enabled) return null;
          const adapted = await aiService.adaptContent(state.currentDraft.text, platform);
          return [platform, adapted] as const;
        })
      );

      const defaultAdaptations: Record<SocialPlatform, string> = {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
      };
      dispatch({
        type: 'UPDATE_ADAPTATIONS',
        payload: {
          ...defaultAdaptations,
          ...Object.fromEntries(adaptations.filter((adaptation): adaptation is [SocialPlatform, string] => adaptation !== null))
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [state.currentDraft, platforms, dispatch]);

  return (
    <div className="flex flex-col gap-4">
      {import.meta.env.DEV && <TestHarness />}
      <div className="flex gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Create Post</h2>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => {/* TODO: Save draft */}}
              >
                Save Draft
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                disabled={isSubmitting}
                onClick={handlePreviewAdaptations}
              >
                Preview Adaptations
              </button>
            </div>
          </div>

          <textarea
            className="w-full min-h-[200px] p-4 border rounded-lg resize-y"
            value={state.currentDraft?.text || ''}
            onChange={handleContentChange}
            placeholder="Write your content here..."
          />
        </div>
        
        <div className="w-96 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Platform Previews</h3>
          {platforms.map(platform => (
            state.currentDraft?.platformSettings[platform].enabled && (
              <PlatformPreview
                key={platform}
                platform={platform}
                content={state.adaptations[platform] || state.currentDraft?.text || ''}
                images={state.currentDraft?.images.map(img => img.url)}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
};