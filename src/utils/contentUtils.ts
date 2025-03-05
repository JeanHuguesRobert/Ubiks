import DOMPurify from 'isomorphic-dompurify';
import { ContentDraft } from '../types/Content';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

/**
 * Extracts plain text from HTML content
 */
export const htmlToPlainText = (html: string): string => {
  // Create a temporary element to render the HTML
  const tempEl = document.createElement('div');
  tempEl.innerHTML = html;
  return tempEl.textContent || tempEl.innerText || '';
};

/**
 * Saves a draft to localStorage
 */
export const saveDraftToLocalStorage = (draft: ContentDraft): void => {
  try {
    // Get existing drafts
    const storedDrafts = localStorage.getItem('ubikial_content_drafts');
    const drafts: Record<string, ContentDraft> = storedDrafts ? JSON.parse(storedDrafts) : {};
    
    // Add or update this draft
    drafts[draft.id] = {
      ...draft,
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('ubikial_content_drafts', JSON.stringify(drafts));
  } catch (error) {
    console.error('Error saving draft to localStorage:', error);
  }
};

/**
 * Loads all drafts from localStorage for a user
 */
export const loadDraftsFromLocalStorage = (userId: string): ContentDraft[] => {
  try {
    const storedDrafts = localStorage.getItem('ubikial_content_drafts');
    if (!storedDrafts) return [];
    
    const drafts: Record<string, ContentDraft> = JSON.parse(storedDrafts);
    
    // Filter drafts by userId and sort by updatedAt (newest first)
    return Object.values(drafts)
      .filter(draft => draft.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error loading drafts from localStorage:', error);
    return [];
  }
};

/**
 * Loads a specific draft from localStorage
 */
export const loadDraftFromLocalStorage = (draftId: string): ContentDraft | null => {
  try {
    const storedDrafts = localStorage.getItem('ubikial_content_drafts');
    if (!storedDrafts) return null;
    
    const drafts: Record<string, ContentDraft> = JSON.parse(storedDrafts);
    return drafts[draftId] || null;
  } catch (error) {
    console.error('Error loading draft from localStorage:', error);
    return null;
  }
};

/**
 * Deletes a draft from localStorage
 */
export const deleteDraftFromLocalStorage = (draftId: string): void => {
  try {
    const storedDrafts = localStorage.getItem('ubikial_content_drafts');
    if (!storedDrafts) return;
    
    const drafts: Record<string, ContentDraft> = JSON.parse(storedDrafts);
    
    // Delete the draft
    delete drafts[draftId];
    
    // Save back to localStorage
    localStorage.setItem('ubikial_content_drafts', JSON.stringify(drafts));
  } catch (error) {
    console.error('Error deleting draft from localStorage:', error);
  }
};

/**
 * Extracts hashtags from text
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches : [];
};

/**
 * Strips HTML tags from content
 */
export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};
