// src/utils/audioUtils.js
export function evaluatePitch(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
  
    const SIZE = channelData.length;
    const MIN_FREQ = 85; // Minimum frequency to detect (Hz)
    const MAX_FREQ = 440; // Maximum frequency to detect (Hz)
    const MIN_SAMPLES = Math.floor(sampleRate / MAX_FREQ);
    const MAX_SAMPLES = Math.floor(sampleRate / MIN_FREQ);
  
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;
  
    // Compute RMS to check if the signal is strong enough
    for (let i = 0; i < SIZE; i++) {
      rms += channelData[i] * channelData[i];
    }
    rms = Math.sqrt(rms / SIZE);
  
    if (rms < 0.01) {
      console.log('Signal too weak or noisy, RMS:', rms);
      return -1; // Too much noise or silence
    }
  
    const normalizedChannelData = channelData.map((sample) => sample / rms);
  
    // Reset correlations
    const correlations = new Array(MAX_SAMPLES).fill(0);
  
    for (let offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
      let correlation = 0;
  
      // Compute the normalized correlation at each offset
      for (let i = 0; i < SIZE - offset; i++) {
        correlation += normalizedChannelData[i] * normalizedChannelData[i + offset];
      }
      correlations[offset] = correlation;
  
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
  
    // If the best correlation is too low or if no valid offset found, return -1 indicating no pitch detected
    if (bestCorrelation < 0.01 || bestOffset === -1) {
      console.log('No pitch detected. Best correlation too low.');
      return -1;
    }
  
    const estimatedPitch = sampleRate / bestOffset;
    return estimatedPitch > 0 ? estimatedPitch : -1;
  }
  