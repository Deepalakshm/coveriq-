'use client';
import { Language } from '@/hooks/useClinicChat';

interface LanguageToggleProps {
  language: Language;
  onChange: (l: Language) => void;
}

export default function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onChange('English')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'English'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('Tamil')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'Tamil'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}