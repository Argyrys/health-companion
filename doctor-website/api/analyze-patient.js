export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { patientData } = req.body;
  if (!patientData) {
    return res.status(400).json({ error: 'Patient data is required' });
  }

  const prompt = `You are an AI medical assistant helping a doctor review a patient's case. Analyze the following patient data and provide a structured clinical summary.

PATIENT DATA:
${JSON.stringify(patientData, null, 2)}

Provide your analysis in this exact format:

## Risk Assessment
[Overall risk level: Low/Medium/High/Critical with brief explanation]

## Key Findings
[Bullet points of the most important clinical findings]

## Possible Conditions
[List any conditions that the symptoms and history suggest]

## Recommended Actions
[Specific next steps the doctor should consider]

## Areas of Concern
[Any red flags or things that need immediate attention]

Keep the language professional and medical. Be concise but thorough.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'No response from AI' });
    }

    return res.status(200).json({ analysis: text });
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return res.status(500).json({ error: 'Failed to generate analysis' });
  }
}
