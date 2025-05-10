"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TabContent {
  id: string;
  title: string;
  content: string;
  image: string;
}

interface ArtworkStoryTabsProps {
  tabs: TabContent[];
}

/**
 * ArtworkStoryTabs Component
 * Creates a tabbed section with images on the left and text content on the right
 * Inspired by the "ART ON THE MOVE. MY STORY." section in the example
 */
export default function ArtworkStoryTabs({ tabs }: ArtworkStoryTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');

  // Get the currently active tab content
  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="w-full bg-[#EDE9E3] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap border-b border-[#020312]/20 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-base font-medium transition-colors duration-200 relative ${
                activeTab === tab.id
                  ? 'text-[#020312] font-semibold'
                  : 'text-[#020312]/70 hover:text-[#020312]'
              }`}
            >
              {tab.title}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#020312]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTabContent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Image on the left */}
            <motion.div
              key={`image-${activeTabContent.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden"
            >
              <Image
                src={activeTabContent.image}
                alt={activeTabContent.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Content on the right */}
            <motion.div
              key={`content-${activeTabContent.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-[#020312]">
                {activeTabContent.title}
              </h2>
              <p className="text-lg leading-relaxed text-[#020312]/80">
                {activeTabContent.content}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
