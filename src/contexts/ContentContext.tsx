import React, { createContext, useContext, useReducer } from 'react';
import { ContentState, ContentDraft } from '../types/Content';
import { SocialPlatform } from '../types/SocialAccount';

type ContentAction =
  | { type: 'SET_DRAFT'; payload: ContentDraft }
  | { type: 'UPDATE_ADAPTATIONS'; payload: Record<SocialPlatform, string> }
  | { type: 'CLEAR_DRAFT' }
  | { type: 'SET_PLATFORM_PREVIEW'; platform: SocialPlatform; enabled: boolean }
  | { type: 'START_ADAPTATION' }
  | { type: 'ADAPTATION_COMPLETE' };

const initialState: ContentState = {
  currentDraft: null,
  adaptations: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  },
  previewPlatform: null,
  isDirty: false,
  isAdapting: false
};

const ContentContext = createContext<{
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
} | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer((state: ContentState, action: ContentAction) => {
    switch (action.type) {
      case 'SET_DRAFT':
        return { 
          ...state, 
          currentDraft: action.payload, 
          isDirty: true 
        };
      case 'UPDATE_ADAPTATIONS':
        return { 
          ...state, 
          adaptations: action.payload 
        };
      case 'SET_PLATFORM_PREVIEW':
        return {
          ...state,
          previewPlatform: action.platform
        };
      case 'CLEAR_DRAFT':
        return initialState;
      default:
        return state;
    }
  }, initialState);

  return (
    <ContentContext.Provider value={{ state, dispatch }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within ContentProvider');
  return context;
};