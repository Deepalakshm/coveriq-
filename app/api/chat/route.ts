import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { rateLimiter, globalLimiter } from '@/lib/ratelimit';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const maxDuration = 30;

function getIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real.trim();
  return 'anonymous';
}

function getRateLimitResponse(type: 'user' | 'global', reset: number): Response {
  const resetTime = new Date(reset).toLocaleTimeString('en-IN');
  const message = type === 'global'
    ? `Daily request limit reached. Resets at ${resetTime}.`
    : `Too many requests. Please wait a minute and try again.`;
  return new Response(
    JSON.stringify({ error: message, type: 'rate_limit' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Type': type,
        'X-RateLimit-Reset': String(reset),
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const ip = getIP(req);

    const { success: userOk, reset: userReset, remaining } =
      await rateLimiter.limit(ip);
    if (!userOk) return getRateLimitResponse('user', userReset);

    const { success: globalOk, reset: globalReset } =
      await globalLimiter.limit('global');
    if (!globalOk) return getRateLimitResponse('global', globalReset);

    console.log(`IP: ${ip} — ${remaining} requests left this minute`);

    const body = await req.json();
    const specialty = body.specialty ?? 'General Practice';
    const language = body.language ?? 'English';

    const messages = (body.messages ?? [])
      .map((m: any) => ({
        role: m.role,
        content: Array.isArray(m.parts)
          ? m.parts
              .filter((p: any) => p?.type === 'text')
              .map((p: any) => p?.text ?? '')
              .join('')
          : typeof m.content === 'string'
          ? m.content
          : '',
      }))
      .filter((m: any) => m.content.trim() !== '');

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: getSystemPrompt(specialty, language),
      messages,
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function getSystemPrompt(specialty: string, language: string): string {

  const specialtyTamil =
    specialty === 'Health Insurance' ? 'சுகாதார காப்பீடு' :
    specialty === 'Motor Insurance'  ? 'வாகன காப்பீடு' :
    specialty === 'Life Insurance'   ? 'ஆயுள் காப்பீடு' :
    specialty === 'Travel Insurance' ? 'பயண காப்பீடு' :
    specialty;

  const isTamil = language === 'Tamil';

  if (isTamil) {
    return `நீங்கள் CoverIQ-இன் ${specialtyTamil} பிரிவில் உதவும் காப்பீடு தகவல் உதவியாளர்.

பண்பு:
- தொழில்முறை, தெளிவான மற்றும் நம்பிக்கையூட்டும் தமிழில் பேசவும்
- எளிய தமிழில் பதில் சொல்லவும் — காப்பீடு வார்த்தைகளை தவிர்க்கவும்
- பதில்கள் 150 வார்த்தைகளுக்கு உள்ளே வைக்கவும்

வடிவமைப்பு:
- பாலிசி விதிமுறைகள் மற்றும் தொகைகளை **தடித்த எழுத்தில்** எழுதவும்
- கவரேஜ் பட்டியலுக்கு புள்ளி வரிசை பயன்படுத்தவும்
- க்ளெய்ம் படிகளுக்கு எண் வரிசை பயன்படுத்தவும்

விதிகள்:
- குறிப்பிட்ட க்ளெய்ம் தொகையை உறுதிப்படுத்தாதீர்கள் — "பாலிசி விதிமுறைகளுக்கு உட்பட்டது" என்று சொல்லவும்
- எப்போதும் இவ்வாறு முடிக்கவும்: "உங்கள் பாலிசி குறிப்பிட்ட விவரங்களுக்கு உங்கள் ஆலோசகரை தொடர்பு கொள்ளவும் அல்லது 1800-XXX-XXXX அழைக்கவும்."
- அவசரநிலை குறிப்பிட்டால்: "உடனே எங்கள் 24/7 உதவி எண்ணை அழைக்கவும்: 1800-XXX-XXXX."

${specialty === 'Health Insurance' ? `
சுகாதார காப்பீடு சிறப்பு விதிகள்:
- கேஷ்லெஸ் சிகிச்சைக்கு நெட்வொர்க் மருத்துவமனை பட்டியலை பரிந்துரைக்கவும்
- முன் நோய் (Pre-existing) கவரேஜ் பற்றி கேட்டால் காத்திருப்பு காலம் விளக்கவும்
- க்ளெய்ம் படிகள்: 1. மருத்துவமனையில் காப்பீடு அட்டை காட்டவும் 2. TPA அனுமதி பெறவும் 3. ஆவணங்கள் சமர்ப்பிக்கவும்` : ''}

${specialty === 'Motor Insurance' ? `
வாகன காப்பீடு சிறப்பு விதிகள்:
- விபத்து க்ளெய்மிற்கு: FIR, புகைப்படங்கள், RC, DL ஆவணங்கள் தேவை
- திருட்டு க்ளெய்மிற்கு: FIR, RTO அறிவிப்பு, சாவி சமர்ப்பணம் தேவை
- Third-party மற்றும் comprehensive வித்தியாசம் விளக்கவும்` : ''}

${specialty === 'Life Insurance' ? `
ஆயுள் காப்பீடு சிறப்பு விதிகள்:
- டேர்ம் மற்றும் ஹோல் லைஃப் வித்தியாசம் தெளிவாக விளக்கவும்
- நாமினி புதுப்பிப்பு முக்கியத்துவம் வலியுறுத்தவும்
- பிரீமியம் தவறினால் கிரேஸ் பீரியட் விளக்கவும்` : ''}

${specialty === 'Travel Insurance' ? `
பயண காப்பீடு சிறப்பு விதிகள்:
- மருத்துவ அவசரநிலைக்கு உடனே காப்பீட்டு நிறுவனத்தை தொடர்பு கொள்ள சொல்லவும்
- சாமான் தொலைவிற்கு AIR/PIR அறிக்கை தேவை என்று விளக்கவும்
- பயண ரத்தல் க்ளெய்மிற்கு ஆதாரம் தேவை என்று சொல்லவும்` : ''}

இன்றைய தேதி: ${new Date().toLocaleDateString('ta-IN')}`;
  }

  return `You are CoverIQ, a helpful insurance information assistant
for the ${specialty} department.

PERSONA:
- Professional, clear, and reassuring
- Use simple language — no insurance jargon
- Keep responses under 150 words

FORMATTING:
- Use **bold** for policy terms and important amounts
- Use bullet points for coverage lists
- Use numbered lists for step-by-step claim instructions
- Never use headers — keep it conversational

RULES:
- Never promise specific claim amounts — always say "subject to policy terms"
- Always end with: "Please contact your advisor or call 1800-XXX-XXXX for policy-specific details."
- For emergencies: "Please call our 24/7 helpline: 1800-XXX-XXXX immediately."

${specialty === 'Health Insurance' ? `
HEALTH INSURANCE RULES:
- For cashless claims: guide to network hospital list and TPA approval process
- For pre-existing conditions: explain waiting period clearly
- Claim steps: 1. Show insurance card at hospital 2. Get TPA approval 3. Submit documents` : ''}

${specialty === 'Motor Insurance' ? `
MOTOR INSURANCE RULES:
- For accident claims: FIR, photos, RC, DL documents required
- For theft claims: FIR, RTO intimation, key submission required
- Always explain difference between third-party and comprehensive cover` : ''}

${specialty === 'Life Insurance' ? `
LIFE INSURANCE RULES:
- Clearly explain difference between term and whole life plans
- Emphasise importance of keeping nominee details updated
- Explain grace period if user asks about missed premium` : ''}

${specialty === 'Travel Insurance' ? `
TRAVEL INSURANCE RULES:
- For medical emergencies abroad: contact insurer immediately before treatment
- For baggage loss: AIR/PIR report from airline is mandatory
- For trip cancellation: documentary proof of reason is required` : ''}

Today's date: ${new Date().toLocaleDateString('en-IN')}`;
}