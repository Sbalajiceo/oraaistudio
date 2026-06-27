import { useState, useCallback } from 'react';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-6';

const HEALTH_CONTEXT = `You are Ora, a personal health AI assistant. You help users understand their health data and provide clear, empathetic insights.

Current health snapshot for Sandeep:
- Heart rate: 68 bpm (normal resting)
- Blood pressure: 118/78 mmHg (healthy)
- SpO2: 98% (optimal)
- Steps today: 4,521 (goal: 10,000)
- Water intake: 3 of 8 glasses
- HRV: 68ms (above personal baseline of 58ms)
- Sleep last night: 7h 12m — Deep 1h22m, REM 2h05m, Light 3h30m (score: 70)
- Recovery score: 82 (good to exercise)
- LDL: elevated (flagged for heart plan)
- Medications: Vitamin D3 taken, Omega 3 and Magnesium pending

Respond concisely — 2–3 sentences for voice queries, 4–6 sentences max for detailed questions. Do not use markdown formatting in your response.`;

export function useAnthropic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (userMessage: string): Promise<string> => {
    if (!API_KEY) {
      return getDemoResponse(userMessage);
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 256,
          system: HEALTH_CONTEXT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      return (data.content?.[0]?.text as string) ?? "I couldn't get a response right now.";
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return getDemoResponse(userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { ask, loading, error };
}

const DEMOS: [RegExp, string][] = [
  [/heart|bpm|rate/i, 'Your heart rate has been steady at 68–72 bpm this week. That\'s a healthy resting range for you.'],
  [/bp|blood pressure/i, 'Your blood pressure is 118/78 — well within the healthy range. Keep it up with your current routine.'],
  [/spo2|oxygen|o2/i, 'SpO2 at 98% is optimal. Your oxygen levels are consistently strong.'],
  [/sleep|rem|deep/i, 'You got 7h 12m last night with good REM at 2h 05m. Your recovery score of 82 reflects that.'],
  [/hrv|variability/i, 'Your HRV is 68ms — above your personal baseline of 58ms. That\'s a sign your nervous system is well-recovered.'],
  [/ldl|cholesterol|heart plan/i, 'Your LDL is elevated. I\'d suggest adding omega-3 rich foods and reducing saturated fats. Want a tailored heart plan?'],
  [/steps|walk|activity/i, 'You\'ve hit 4,521 steps today — 45% of your 10k goal. A 30-minute walk this afternoon would get you close.'],
  [/water|hydrat/i, 'You\'ve had 3 of 8 glasses today. Aim for 2 more by lunch to stay on track.'],
  [/med|vitamin|omega|magnesium/i, 'Vitamin D3 is done. Omega 3 is due at 2 PM and Magnesium at 10 PM — I\'ll remind you.'],
  [/eat|food|diet|meal/i, 'Given your elevated LDL, today aim for fatty fish, leafy greens, and limit red meat. An anti-inflammatory approach suits your numbers.'],
  [/remind|reminder/i, 'I\'ve noted that. I\'ll send you a reminder at the right time.'],
];

function getDemoResponse(query: string): string {
  for (const [pattern, response] of DEMOS) {
    if (pattern.test(query)) return response;
  }
  return 'Your health data looks good overall. Your recovery is strong at 82 and HRV is above baseline. What specific area would you like to explore?';
}
