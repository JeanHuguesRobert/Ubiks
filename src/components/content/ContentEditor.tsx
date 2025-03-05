import React, { useState, useEffect, useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { Hash, Image, ImagePlus, Paperclip, Smile, Type, X } from 'lucide-react';
import { ContentDraft } from '../../types/Content';

interface ContentEditorProps {
  content: ContentDraft;
  onChange: (content: ContentDraft) => void;
  autoSave?: boolean;
  placeholder?: string; // Add optional placeholder
}

const ContentEditor = ({ content, onChange, autoSave = true, placeholder }: ContentEditorProps) => {
  const [html, setHtml] = useState(content.html || '');
  const [plainText, setPlainText] = useState(content.text || '');
  const [showToolbar, setShowToolbar] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial content when component loads
  useEffect(() => {
    if (content.html && content.html !== html) {
      setHtml(content.html);
    }
  }, [content.html, html]);

  // Autosave content to parent component
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        if (html || plainText || content.images.length > 0) {
          onChange({
            ...content,
            html,
            text: plainText,
            lastSaved: new Date().toISOString()
          });
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [html, plainText, content, onChange, autoSave]);

  const handleChange = (evt: ContentEditableEvent) => {
    const newHtml = evt.target.value;
    setHtml(newHtml);
    setPlainText(newHtml.replace(/<[^>]*>/g, ''));
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowToolbar(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Keep toolbar visible if there's content
    if (!html && !content.images.length) {
      setShowToolbar(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each selected file
    Array.from(files).forEach(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) return;
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      // Update content with new image
      const updatedImages = [...content.images, {
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        file: file,
        name: file.name
      }];
      
      onChange({
        ...content,
        images: updatedImages
      });
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setShowImageUpload(false);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = content.images.filter(img => img.id !== imageId);
    onChange({
      ...content,
      images: updatedImages
    });
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      setHtml(contentEditableRef.current.innerHTML);
      setPlainText(contentEditableRef.current.innerText);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {showToolbar && (
        <div className="px-4 py-2 border-b border-gray-200 flex items-center flex-wrap">
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('bold')}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('italic')}
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('underline')}
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
          <span className="mx-2 text-gray-300">|</span>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={handleImageUpload}
            title="Add image"
          >
            <ImagePlus size={18} />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet list"
          >
            <span className="text-lg">•</span>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('insertOrderedList')}
            title="Numbered list"
          >
            <span className="text-lg">1.</span>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded mr-1"
            onClick={() => formatText('insertHTML', '<br>#')}
            title="Add hashtag"
          >
            <Hash size={18} />
          </button>
        </div>
      )}
      
      {/* Media preview area */}
      {content.images.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {content.images.map(image => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="h-24 w-24 object-cover rounded border border-gray-200"
                />
                <button
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
        multiple
      />
      
      {/* Content editable area */}
      <div className="px-4 py-3">
        <ContentEditable
          innerRef={contentEditableRef}
          html={html}
          disabled={false}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="outline-none min-h-[150px] max-h-[500px] overflow-y-auto"
          data-placeholder={placeholder} // Use data attribute for placeholder
        />
      </div>
    </div>
  );
};

export default ContentEditor;
