<script setup lang="ts">
  import {defineProps} from "vue";
  import type {TaskType} from "../../Types.ts";

  const props = defineProps<{
    task: TaskType
  }>()

</script>

<template>
  <div >
    <h3>{{props.task.title}}</h3>
    <h4>{{props.task.id}}</h4>
    <div>
      <span v-for="tag in props.task.tags" class="bg-blue-400 p-1 ml-2 mr-2">{{tag}}</span>
    </div>
    <div>
      <p><span>Создано: </span>{{props.task.createdAt}}</p>
      <p><span>Изменено: </span>{{props.task.updatedAt}}</p>
    </div>
  </div>
</template>

<style scoped>

</style>


