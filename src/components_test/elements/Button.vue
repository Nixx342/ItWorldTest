<script setup lang="ts">
    import { defineProps } from 'vue';

    const props = defineProps<{
        title: string
        func: () => void
        classes: string|null
    }>()


</script>

<template>
    <button 
        @click="props.func"
        :class="['bg-green-600', 'text-white', 'px-4 py-2 rounded-md shadow hover:bg-green-700 transition', props.classes]"
    >
        {{ props.title }}
    </button>
</template>