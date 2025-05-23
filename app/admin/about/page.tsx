"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/image-uploader';
import Image from 'next/image';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

/**
 * About Page Editor
 * Allows editing of artist statement, descriptions, and images for the About page
 * that matches the Roburico.com example
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
              id: 'statement',
              title: 'Artist Statement',
              content: 'MY STORY: DRAWING IS MY BRAIN\'S INSTANT TRANSLATOR, TURNING BUZZING THOUGHTS INTO VIVID VISUALS. IT\'S NOT ART—IT\'S JUST MY VISUAL VOICE.',
              order: 0,
            },
            {
              id: 'main_image',
              title: 'Main Artist Image',
              content: '',
              order: 1,
            },
            {
              id: 'main_description',
              title: 'Main Description',
              content: 'From Miami to New York, my artwork has been exhibited around the world. Each piece is meticulously printed on archival paper, ensuring rich colors and vibrant details that remain as unfaded passion, connected to fleeting moments and deeper stories.',
              order: 2,
            },
            {
              id: 'gallery_image_1',
              title: 'Gallery Image 1',
              content: '',
              order: 3,
            },
            {
              id: 'gallery_image_2',
              title: 'Gallery Image 2',
              content: '',
              order: 4,
            },
            {
              id: 'gallery_image_3',
              title: 'Gallery Image 3',
              content: '',
              order: 5,
            },
            {
              id: 'secondary_description',
              title: 'Secondary Description',
              content: 'Fueled by my partner\'s support, I\'ve been able creating my artwork for over a decade. Each piece represents a personal thrill, and above all, a chance to touch people\'s souls, dreams, and be inspired by my creations.',
              order: 6,
            },
            {
              id: 'signature',
              title: 'Signature',
              content: '',
              order: 7,
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
    // @ts-expect-error - TypeScript doesn't know we're only setting string fields with string values
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

      console.log('Saving about page content:', upsertData);

      // First delete all existing content to avoid conflicts
      const { error: deleteError } = await supabase
        .from('page_content')
        .delete()
        .eq('page', 'about');

      if (deleteError) {
        console.error('Error deleting existing content:', deleteError);
        throw deleteError;
      }

      // Then insert the new content
      const { data, error: insertError } = await supabase
        .from('page_content')
        .insert(upsertData)
        .select();

      if (insertError) {
        console.error('Error inserting content:', insertError);
        throw insertError;
      }

      console.log('Successfully saved content:', data);

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">About Page Editor</h1>
        <div className="flex items-center space-x-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Content saved successfully!</p>}
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

      <div className="space-y-8">
        {sections.map((section, index) => {
          const isTextSection = ['statement', 'main_description', 'secondary_description'].includes(section.id);
          const isImageSection = ['main_image', 'gallery_image_1', 'gallery_image_2', 'gallery_image_3', 'signature'].includes(section.id);
          
          return (
            <div key={section.id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">{section.title}</h2>
                <div className="text-sm text-gray-500">ID: {section.id}</div>
              </div>

              {isTextSection && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {section.id === 'statement' ? 'Artist Statement' : 'Description'}
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    rows={section.id === 'statement' ? 3 : 5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={section.id === 'statement' ? 'Enter artist statement here...' : 'Enter description here...'}
                  />
                  {section.id === 'statement' && (
                    <p className="mt-1 text-xs text-gray-500">
                      This will appear as the headline at the top of the page. Use all caps for emphasis.
                    </p>
                  )}
                </div>
              )}

              {isImageSection && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-2 text-sm font-medium text-gray-700">Upload Image</div>
                      <ImageUploader
                        multiple={false}
                        bucketName="about"
                        onUploadComplete={(urls) => handleImageUpload(index, urls)}
                        folderPath={section.id}
                      />
                    </div>

                    {section.image_url && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={section.image_url}
                            alt={section.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
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
              )}

              <div className="text-xs text-gray-500 mt-2">
                Order: {section.order + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
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
  );
}
