<script setup lang="ts">
import {defineProps, defineEmits, ref,watch} from 'vue'
import type {TaskType} from "../Types.ts";

const props = defineProps<{
  task: TaskType
}>()


watch(() => props.task, (newTask) => {
  if (!isEditing.value) {
    editableTask.value = { ...newTask };
    tagInput.value = newTask.tags.join(', ');
  }
});

const emit = defineEmits(['update:task', 'click', 'delete'])
const isEditing = ref(false)
const editableTask = ref<TaskType>({ ...props.task })
const tagInput = ref(editableTask.value.tags.join(', '))

function startEditing() {
  isEditing.value = true
  editableTask.value = { ...props.task }
  tagInput.value = editableTask.value.tags.join(', ')
}

function cancelEditing() {
  isEditing.value = false
  editableTask.value = { ...props.task }
  tagInput.value = editableTask.value.tags.join(', ')
}
function saveChanges() {
  editableTask.value.tags = tagInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  emit('update:task', { ...editableTask.value })
  isEditing.value = false
}

function onStatusChange() {
  emit('update:task', { ...editableTask.value })
}
function deleteTask() {
  if (confirm('Вы точно хотите удалить эту задачу?')) {
    emit('delete', props.task.id)
  }
}

function formatDate(isoString: string) {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

</script>

<template>
  <div class="p-4 border rounded shadow max-w-md bg-white">
    <label>
      Статус: 
      <select v-model="editableTask.status" @change="onStatusChange">
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </label>
    <div class="mt-2">
      <template v-if="isEditing">
        <input v-model="editableTask.title" class="w-full border rounded px-2 py-1" />
      </template>
      <template v-else>
        <h2 class="text-xl font-semibold mb-2" @dblclick="startEditing">{{ props.task.title }}</h2>
      </template>
    </div>
    <div class="mb-2">
      <label>Теги:</label>
      <template v-if="isEditing">
        <input v-model="tagInput" placeholder="Введите теги через запятую" class="w-full border rounded px-2 py-1" />
      </template>
      <template v-else>
        <span v-for="tag in props.task.tags" :key="tag" class="inline-block bg-blue-200 text-blue-800 rounded px-2 py-1 mr-1 text-xs">
          {{ tag }}
        </span>
      </template>
    </div>
    <div v-if="isEditing" class="flex gap-2">
        <button @click="saveChanges" class="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
        <button @click="cancelEditing" class="px-2 py-2 bg-gray-400 rounded hover:bg-gray-500">Отмена</button>
        <button @click="deleteTask" class="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600">Удалить</button>
    </div>
  </div>
</template>
