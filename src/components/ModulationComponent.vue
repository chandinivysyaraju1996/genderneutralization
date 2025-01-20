<template>
  <div class="modulation-container">
   
    <div v-if="detectedPitch" class="detected-pitch">
      <p><strong>Detected Pitch:</strong> {{ detectedPitch }} Hz</p>
    </div>

    <div v-if="pitchShifter" class="modulation-controls">
      <div class="slider-group">
        <label for="speed">Speed:</label>
        <input type="range" id="speed" min="0.5" max="2.0" step="0.01" v-model="speed" @input="updatePitchShifter" />
        <span>{{ speed }}</span>
      </div>

      <div class="slider-group">
        <label for="pitch">Pitch:</label>
        <input type="range" id="pitch" min="0.5" max="2.0" step="0.01" v-model="pitch" @input="updatePitchShifter" />
        <span>{{ pitch }}</span>
      </div>

      <div class="lowpass-group">
        <label for="lowpass-cutoff">Lowpass Filter Cutoff Frequency (Hz):</label>
        <input
          type="number"
          id="lowpass-cutoff"
          v-model.number="lowpassCutoffFrequency"
          min="20"
          max="20000"
          step="10"
        />
      </div>

      <div class="button-group">
        <button @click="applyLowpassFilter">Apply Lowpass Filter</button>
        <button @click="playAudio">Play</button>
        <button @click="submitChanges">Submit</button>
        <button @click="downloadLogs">Download Logs</button>
        <a v-if="audioURL" :href="audioURL" download="recorded_audio.wav">Download Original Audio</a>
      </div>
    </div>

    <div class="close-button">
      <button @click="$emit('close')">Home</button>
    </div>
  </div>
</template>

<script>
import { PitchShifter } from "soundtouchjs";
import { evaluatePitch } from "@/utils/audioUtils.js";

export default {
  props: {
    arrayBuffer: {
      type: ArrayBuffer,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      audioContext: null,
      gainNode: null,
      pitchShifter: null,
      lowpassFilter: null,
      lowpassCutoffFrequency: 3500,
      speed: 1.0,
      pitch: 1.0,
      detectedPitch: null,
      logs: [],
      modulatedPitch: null,
      audioURL: null
    };
  },
  watch: {
    arrayBuffer: {
      immediate: true,
      handler(newBuffer) {
        if (newBuffer) {
          this.processAudioBuffer(newBuffer);
        }
      },
    },
  },
  methods: {
    processAudioBuffer(arrayBuffer) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();

      this.audioContext.decodeAudioData(arrayBuffer, async (audioBuffer) => {
        this.detectedPitch = evaluatePitch(audioBuffer);
        let pitchShiftFactor = 1.25;
        // const idealPitch = 190;
        // let pitchShiftFactor = idealPitch / this.detectedPitch;

        // if (pitchShiftFactor > 1 && pitchShiftFactor < 1.2) {
        //   pitchShiftFactor = 1.2;
        // }
        // if (pitchShiftFactor < 1 && pitchShiftFactor > 0.8) {
        //   pitchShiftFactor = 0.8;
        // }
        if(this.detectedPitch > 180){
          pitchShiftFactor = 0.7;
        }
        else{
          pitchShiftFactor = 1.4;
        }
        this.modulatedPitch = this.detectedPitch * pitchShiftFactor;

        if (this.pitchShifter) {
          this.pitchShifter.off();
        }

        this.pitchShifter = new PitchShifter(this.audioContext, audioBuffer, 1024);
        this.pitchShifter.tempo = this.speed;
        this.pitchShifter.pitch = pitchShiftFactor;
        this.pitch = pitchShiftFactor;
      });
    },
    applyLowpassFilter() {
      if (!this.audioContext) {
        alert("Audio context not initialized. Please upload a file first.");
        return;
      }

      if (!this.lowpassFilter) {
        this.lowpassFilter = this.audioContext.createBiquadFilter();
        this.lowpassFilter.type = "lowpass";
      }

      this.lowpassFilter.frequency.value = this.lowpassCutoffFrequency;

      if (this.pitchShifter) {
        this.pitchShifter.connect(this.lowpassFilter);
        this.lowpassFilter.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }
    },
    playAudio() {
      if (!this.pitchShifter) {
        alert("Please upload a file first!");
        return;
      }

      if (!this.lowpassFilter) {
        this.gainNode.connect(this.audioContext.destination);
      }

      this.pitchShifter.connect(this.lowpassFilter || this.gainNode);
    },
    updatePitchShifter() {
      if (this.pitchShifter) {
        this.pitchShifter.tempo = this.speed;
        this.pitchShifter.pitch = this.pitch;
      }
    },
    submitChanges() {
      if (!this.detectedPitch) {
        alert("No pitch detected. Please process audio first.");
        return;
      }

      const logEntry = `Filename: ${this.fileName}, Original Pitch: ${this.detectedPitch} Hz, Modulated Pitch: ${this.modulatedPitch}, Pitch: ${this.pitch}, Lowpass Cutoff: ${this.lowpassCutoffFrequency} Hz\n`;

      const existingLogs = localStorage.getItem("audioLogs") || "";
      const updatedLogs = existingLogs + logEntry;
      localStorage.setItem("audioLogs", updatedLogs);

      alert("Log saved. You can download logs when needed.");
    },
    downloadLogs() {
      const logs = localStorage.getItem("audioLogs") || "No logs available.";
      const blob = new Blob([logs], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.fileName}_log.txt` || "audio_log.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } 
  },
};
</script>

<style scoped>
.modulation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.detected-pitch p {
  font-size: 1.2rem;
  font-weight: normal;
}

.modulation-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.slider-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-group input {
  width: 200px;
}

.lowpass-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lowpass-group input {
  width: 100px;
}

.button-group {
  display: flex;
  justify-content: space-evenly;
  gap: 10px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}

.close-button {
  margin-top: 20px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
