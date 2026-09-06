export const analyzePatient = async (patientData) => {
  const response = await fetch('/api/analyze-patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientData }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to analyze patient' }));
    throw new Error(err.error || 'AI analysis failed');
  }

  const data = await response.json();
  return data.analysis;
};
