export const generateTicketNumber = (departmentId: string, currentCount: number) => {
  const prefix = departmentId.substring(0, 1).toUpperCase();
  const paddedNumber = (currentCount + 1).toString().padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
};

export const playAudioAnnouncement = (ticketNumber: string, counterNumber: string) => {
  if ('speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Announce ticket clearly
    const text = `Ticket number ${ticketNumber.replace('-', ' ')}. Please proceed to Counter ${counterNumber}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to use a nice sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0]; // Usually default English
    }
    
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  }
};
