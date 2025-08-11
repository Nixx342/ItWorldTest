<script setup lang="ts">
  import Task from "./elements/Task.vue";

  const tasks = [
    {
      "id": "1",
      "title": "Создать дизайн интерфейса",
      "status": "in-progress",
      "tags": ["design", "ui"],
      "subtasks": [],
      "createdAt": "2025-08-10T12:00:00.000Z",
      "updatedAt": "2025-08-11T09:30:00.000Z"
    },
    {
      "id": "2",
      "title": "Реализовать API",
      "status": "todo",
      "tags": ["backend", "api"],
      "subtasks": [
        {
          "id": "2.1",
          "title": "Написать документацию",
          "status": "todo",
          "tags": ["documentation"],
          "subtasks": [],
          "createdAt": "2025-08-10T13:00:00.000Z",
          "updatedAt": "2025-08-10T13:00:00.000Z"
        }
      ],
      "createdAt": "2025-08-10T12:30:00.000Z",
      "updatedAt": "2025-08-10T12:30:00.000Z"
    },
    {
      "id": "3",
      "title": "Тестирование приложения",
      "status": "done",
      "tags": ["testing", "qa"],
      "subtasks": [],
      "createdAt": "2025-08-09T10:00:00.000Z",
      "updatedAt": "2025-08-12T08:00:00.000Z"
    }
  ]

</script>

<template>
    <div class="border border-white text-white">
      <Task v-for="task in tasks" :key="task.id" :task="task" class="border border-orange-300 m-2"/>
    </div>
</template>