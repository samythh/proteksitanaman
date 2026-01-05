// File: src/components/strapi/section-renderer.tsx
import React from 'react';
import HeroSlider from '@/components/sections/HeroSlider';
// Import tipe HeroSliderBlock
import { HeroSliderBlock } from '@/types/sections';

interface SectionProps {
   __component: string;
   id: number;
   [key: string]: unknown;
}

interface Props {
   sections: SectionProps[];
}

export default function SectionRenderer({ sections }: Props) {
   if (!sections || !Array.isArray(sections)) return null;

   return (
      <div className="flex flex-col w-full">
         {sections.map((section, index) => {
            switch (section.__component) {
               case 'sections.hero-slider':
                  // PERBAIKAN: Casting 'section' ke tipe 'HeroSliderBlock' yang benar
                  return <HeroSlider key={`${section.__component}-${index}`} data={section as unknown as HeroSliderBlock} />;

               default:
                  return null;
            }
         })}
      </div>
   );
}