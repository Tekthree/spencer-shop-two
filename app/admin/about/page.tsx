"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/image-uploader';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

/**
 * About Page Editor
 * Allows editing of artist biography, statement, and exhibitions
 */
export default function AboutPageAdmin() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing content sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page', 'about')
          .order('order');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setSections(data);
        } else {
          // Initialize with default sections if none exist
          setSections([
            {
              id: 'bio',
              title: 'Biography',
              content: '',
              order: 0,
            },
            {
              id: 'statement',
              title: 'Artist Statement',
              content: '',
              order: 1,
            },
            {
              id: 'exhibitions',
              title: 'Exhibitions',
              content: '',
              order: 2,
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching about page content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Update section content
  const updateSection = (index: number, field: keyof ContentSection, value: string) => {
    const newSections = [...sections];
    // @ts-ignore - TypeScript doesn't know we're only setting string fields with string values
    newSections[index][field] = value;
    setSections(newSections);
  };

  // Handle image upload for a section
  const handleImageUpload = (index: number, urls: string[]) => {
    if (urls.length > 0) {
      const newSections = [...sections];
      newSections[index].image_url = urls[0];
      setSections(newSections);
    }
  };

  // Add new section
  const addSection = () => {
    const newOrder = sections.length > 0 
      ? Math.max(...sections.map(s => s.order)) + 1 
      : 0;
      
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: 'New Section',
        content: '',
        order: newOrder,
      },
    ]);
  };

  // Remove section
  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    
    // Update order values
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    
    setSections(newSections);
  };

  // Move section up or down
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order values
    const temp = newSections[index].order;
    newSections[index].order = newSections[targetIndex].order;
    newSections[targetIndex].order = temp;
    
    // Sort by order
    newSections.sort((a, b) => a.order - b.order);
    
    setSections(newSections);
  };

  // Save all sections
  const saveContent = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for upsert
      const upsertData = sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        image_url: section.image_url,
        order: section.order,
        page: 'about',
      }));

      // Delete existing sections first
      await supabase
        .from('page_content')
        .delete()
        .eq('page', 'about');

      // Insert new sections
      const { error } = await supabase
        .from('page_content')
        .insert(upsertData);

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving about page content:', err);
      setError('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif mb-2">About Page Editor</h1>
        <p className="text-gray-600">Manage your artist biography, statement, and exhibitions</p>
      </header>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          Content saved successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(index, 'title', e.target.value)}
                className="text-xl font-serif border-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <textarea
                value={section.content}
                onChange={(e) => updateSection(index, 'content', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter content here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ImageUploader
                  multiple={false}
                  label="Section Image (Optional)"
                  onUpload={(urls) => handleImageUpload(index, urls)}
                  bucket="about"
                  folderPath={section.id}
                />
              </div>

              {section.image_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = [...sections];
                        delete newSections[index].image_url;
                        setSections(newSections);
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </button>

          <button
            type="button"
            onClick={saveContent}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
