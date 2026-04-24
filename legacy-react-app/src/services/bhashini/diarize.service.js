export const diarizeAudio = async (audioBlob) => {
  console.log('Diarizing audio data into segments...');
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // In production, hits Bhashini VAD endpoint to return segments
  return [
    { start: 0, end: 5.2, speaker: 'Speaker 1', languageHint: 'en' },
    { start: 5.5, end: 12.0, speaker: 'overlap', overlap: true, languageHint: 'hi' },
    { start: 12.5, end: 18.2, speaker: 'Speaker 2', languageHint: 'te' }
  ];
};
