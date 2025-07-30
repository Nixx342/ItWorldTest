<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps<{
  openModal: () => void,
  openImportModal: () => void,
  exportProjects: () => void,
}>()
</script>

<template>
  <header class="flex justify-end gap-4 p-4 bg-gray-200">
    <button
        class="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        type="button"
        @click="props.openModal"
    >
      Добавить задачу
    </button>
    <button
        class="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
        type="button"
        @click="props.exportProjects"
    >
      Экспортировать
    </button>
    <button
        class="bg-yellow-500 text-white px-4 py-2 rounded-md shadow hover:bg-yellow-600 transition"
        type="button"
        @click="props.openImportModal"
    >
      Импортировать
    </button>
  </header>
</template>
