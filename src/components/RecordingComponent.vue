<template>
  <div class="recording">
    <h2>Record Audio</h2>

    <!-- Feature Toggles -->
    <div class="audio-settings">
      <h3>Audio Settings</h3>
      <div class="settings-group">
        <label>
          Echo Cancellation:
          <input type="checkbox" v-model="audioSettings.echoCancellation" />
        </label>
        <label>
          Noise Suppression:
          <input type="checkbox" v-model="audioSettings.noiseSuppression" />
        </label>
        <label>
          Auto Gain Control:
          <input type="checkbox" v-model="audioSettings.autoGainControl" />
        </label>
      </div>
    </div>

    <!-- Recording Controls -->
    <div class="recording-controls">
      <button @click="startRecording" :disabled="isRecording">Start Recording</button>
      <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>
      <a v-if="audioURL" :href="audioURL" download="recorded_audio.wav">Download Original Audio</a>
      <button @click="redirectToModulation" :disabled="!audioURL">Modulate Audio</button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["recorded"],
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      recordedChunks: [],
      audioURL: null,
      blob: null,
      audioSettings: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    };
  },
  methods: {
    async startRecording() {
      try {
        this.recordedChunks = [];

        // Get user media with the selected audio settings
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: this.audioSettings.echoCancellation,
            noiseSuppression: this.audioSettings.noiseSuppression,
            autoGainControl: this.audioSettings.autoGainControl,
          },
        });

        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.isRecording = true;

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: "audio/wav" });
          this.blob = blob
          this.audioURL = URL.createObjectURL(blob);
          // this.$emit("recorded", blob);
        };
      } catch (err) {
        console.error("Error starting recording:", err);
      }
    },
    stopRecording() {
      if (this.mediaRecorder) {
        this.isRecording = false;
        this.mediaRecorder.stop();
      }
    },
    redirectToModulation() {
      this.$emit("recorded", this.blob);
    },
  },
};
</script>

<style scoped>
.recording {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
}

.audio-settings {
  margin-bottom: 20px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recording-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

a {
  margin-top: 10px;
  font-size: 16px;
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #0056b3;
}
</style>
