<script setup lang="ts">
  import { ref } from "vue";
  import MainPage from "./components_test/MainPage.vue";
import OldStructPage from "./components/OldStructPage.vue";

  const sw = ref(false)
  const swPage = () => {
    sw.value = !sw.value
  }
</script>

<template class="w-full">
  <div class="flex justify-center">
    <button @click="swPage" class="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
      Переключиться
    </button>
  </div>
  <!-- <button @click="swPage" class="text-red ml-[500px]">Переключиться</button> -->
  <OldStructPage v-if="sw" />
  <MainPage v-else class="text-white"/>
  
</template>
