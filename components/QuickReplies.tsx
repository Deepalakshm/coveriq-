'use client';
import { Specialty, Language } from '@/hooks/useClinicChat';

const QUICK_REPLIES: Record<Language, Record<string, string[]>> = {
  English: {
    'Health Insurance': [
      'What does my policy cover?',
      'How to file a cashless claim?',
      'List of network hospitals near me',
      'What is my policy renewal date?',
    ],
    'Motor Insurance': [
      'How to file a motor accident claim?',
      'What is covered under comprehensive plan?',
      'How to add a co-passenger cover?',
      'My car was stolen, what to do?',
    ],
    'Life Insurance': [
      'Difference between term and whole life?',
      'How to update my nominee details?',
      'What happens if I miss a premium?',
      'How to calculate coverage needed?',
    ],
    'Travel Insurance': [
      'Am I covered for trip cancellation?',
      'What medical emergencies are covered abroad?',
      'How to file a baggage loss claim?',
      'Is pre-existing condition covered?',
    ],
  },
  Tamil: {
    'Health Insurance': [
      'என் பாலிசி என்ன உள்ளடக்குகிறது?',
      'கேஷ்லெஸ் க்ளெய்ம் எப்படி செய்வது?',
      'நெட்வொர்க் மருத்துவமனை பட்டியல்',
      'என் பாலிசி புதுப்பிப்பு தேதி என்ன?',
    ],
    'Motor Insurance': [
      'வாகன விபத்து க்ளெய்ம் எப்படி செய்வது?',
      'கம்ப்ரிஹென்சிவ் பிளானில் என்ன கவர் ஆகும்?',
      'என் கார் திருடப்பட்டது, என்ன செய்வது?',
      'பிரீமியம் எப்போது செலுத்த வேண்டும்?',
    ],
    'Life Insurance': [
      'டேர்ம் மற்றும் ஹோல் லைஃப் வித்தியாசம்?',
      'நாமினி விவரங்களை எப்படி மாற்றுவது?',
      'பிரீமியம் தவறினால் என்ன ஆகும்?',
      'எவ்வளவு கவரேஜ் தேவை?',
    ],
    'Travel Insurance': [
      'பயண ரத்தல் கவர் ஆகுமா?',
      'வெளிநாட்டில் மருத்துவ அவசரநிலை கவர் ஆகுமா?',
      'சாமான் தொலைந்தால் க்ளெய்ம் செய்வது எப்படி?',
      'முன் நோய் கவர் ஆகுமா?',
    ],
  },
};

interface QuickRepliesProps {
  specialty: Specialty;
  language: Language;
  onSelect: (text: string) => void;
  visible: boolean;
}

export default function QuickReplies({
  specialty,
  language,
  onSelect,
  visible,
}: QuickRepliesProps) {
  if (!visible) return null;

  const label = language === 'Tamil' ? 'பரிந்துரைக்கப்பட்ட கேள்விகள்' : 'Suggested questions';

  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-gray-400 mb-2 ml-9">{label}</p>
      <div className="flex flex-wrap gap-2 ml-9">
        {QUICK_REPLIES[language][specialty]?.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}