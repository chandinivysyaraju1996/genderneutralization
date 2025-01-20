<template>
  <div class="landing">
    <h1>Welcome to the Gender Neutralization Demo</h1>

    <div class="container" v-if="!showRecording && !showModulation">
      <!-- Upload Card -->
      <div class="card" @click="triggerFileUpload">
        <i class="fas fa-music"></i>
        <p>SELECT ONE OR MORE AUDIO FILES</p>
        <input 
          type="file" 
          @change="handleFileUpload" 
          accept="audio/*" 
          ref="fileInput" 
          style="display: none;" 
        />
      </div>

      <!-- Record Card -->
      <div class="card" @click="startRecording">
        <i class="fas fa-microphone"></i>
        <p>RECORD WITH THE MICROPHONE</p>
        <button style="display: none;" ref="recordButton">Record Audio</button>
      </div>
    </div>

    <!-- Components -->
    <RecordingComponent
      v-if="showRecording"
      @recorded="handleRecordedAudio"
      @close="showRecording = false"
    />

    <ModulationComponent
      v-if="showModulation"
      :arrayBuffer="audioBlob"
      :fileName="fileName"
      @close="showModulation = false"
    />
  </div>
</template>
<script>

import RecordingComponent from "@/components/RecordingComponent.vue";
import ModulationComponent from "@/components/ModulationComponent.vue";

export default {
  name: "LandingPage",
  components: {
    RecordingComponent,
    ModulationComponent,
  },
  data() {
    return {
      showRecording: false,
      showModulation: false,
      audioBlob: null, // Always store ArrayBuffer for consistency
      fileName: null, // Store the uploaded or recorded file's name
    };
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.fileName = file.name; // Set the file name
        const arrayBuffer = await file.arrayBuffer(); // Convert Blob to ArrayBuffer
        this.audioBlob = arrayBuffer; // Store as ArrayBuffer
        this.showModulation = true; // Show modulation interface
      }
    },
    startRecording() {
      this.showRecording = true;
    },
    async handleRecordedAudio(blob) {
      const arrayBuffer = await blob.arrayBuffer(); // Convert recorded Blob to ArrayBuffer
      this.audioBlob = arrayBuffer; // Store as ArrayBuffer
      this.fileName = "recorded_audio.wav"; // Assign a default name for recorded audio
      this.showRecording = false;
      this.showModulation = true;
    },
  },
};
</script>

<style>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 250px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.card i {
  font-size: 50px;
  color: #333;
  margin-bottom: 20px;
}

.card p {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin: 0;
}

input[type="file"] {
  display: none;
}
</style>