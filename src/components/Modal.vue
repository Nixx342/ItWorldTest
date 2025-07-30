<template>
  <div class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits(['close'])

function closeAddTaskModal() {
  emit('close')
}

function handleOverlayClick() {
  closeAddTaskModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4); /* затемнённый фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  min-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
</style>
