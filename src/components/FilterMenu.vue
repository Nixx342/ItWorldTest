<script setup lang="ts">
import {defineEmits, defineProps, ref, computed, watch} from "vue"
import type {ProjectType} from "../Types.ts";

const emit = defineEmits(['openAddProject', 'removeActiveProject', 'update:selectedProjectId', 'update:statusFilter', 'update:nameFilter', 'update:tagFilter'])
function openAddProjectModal() {
  emit('openAddProject',
      'update:selectedProjectId',
      'update:statusFilter',
      'update:nameFilter',
      'update:tagFilter')
}
function removeActiveProject() {
  emit('removeActiveProject')
}
const props = defineProps<{
  projects: ProjectType[],
  selectedProjectId: string,
  statusFilter: string[],
  nameFilter: string,
  tagFilter: string[],
  availableTags: string[],
}>()

const localSelectedProjectId = ref(props.selectedProjectId);
const localStatusFilter = ref([...props.statusFilter])
const localNameFilter = ref(props.nameFilter)
const localTagFilter = ref([...props.tagFilter])

watch(() => props.selectedProjectId, (newVal) => {localSelectedProjectId.value = newVal})
watch(() => props.statusFilter, val => { localStatusFilter.value = [...val] })
watch(() => props.nameFilter, val => { localNameFilter.value = val })
watch(() => props.tagFilter, val => { localTagFilter.value = [...val] })

function toggleStatus(value: string) {
  const index = localStatusFilter.value.indexOf(value)
  if (index === -1) {
    localStatusFilter.value.push(value)
  } else {
    localStatusFilter.value.splice(index, 1)
  }
  emit('update:statusFilter', [...localStatusFilter.value])
}

function onNameFilterChange(newVal: string) {
  localNameFilter.value = newVal
  emit('update:nameFilter', newVal)
}

const input = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)
const dropdownOpen = ref(false)


const statuses = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]
function addTag(tag: string) {
  if (!localTagFilter.value.includes(tag)) {
    localTagFilter.value.push(tag)
    emit('update:tagFilter', [...localTagFilter.value])
  }
  input.value = ''
  dropdownOpen.value = false
  if (tagInputRef.value) tagInputRef.value.blur()
}
function removeTag(tag: string) {
  const index = localTagFilter.value.indexOf(tag)
  if (index !== -1) {
    localTagFilter.value.splice(index, 1)
    emit('update:tagFilter', [...localTagFilter.value])
  }
}
function onInputBlur() {
  setTimeout(() => {
    dropdownOpen.value = false
  }, 200)
}
function onChangeProject() {
  emit('update:selectedProjectId', localSelectedProjectId.value)
}
const filteredTags = computed(() => {
  const inputLower = input.value.toLowerCase().trim()
  return props.availableTags
      .filter(tag => !localTagFilter.value.includes(tag)) // исключаем уже выбранные
      .filter(tag => tag.toLowerCase().includes(inputLower)) // фильтруем по вводу
})
const clearFilters = () => {
  localStatusFilter.value = []
  localNameFilter.value = ''
  localTagFilter.value = []
  input.value = ''
  dropdownOpen.value = false
  if (tagInputRef.value) {
    tagInputRef.value.blur()
  }
  emit('update:statusFilter', [])
  emit('update:nameFilter', '')
  emit('update:tagFilter', [])
}

</script>

<template>
  <div class="fixed top-0 left-0 h-screen w-64 bg-gray-100 flex flex-col pl-[10px] pr-[10px]">
    <div class="w-full flex flex-col">
      <select class="my-[20px] p-2 border border-gray-300 rounded-md bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="localSelectedProjectId"
              @change="onChangeProject"
              
      >
        <option v-if="props.projects.length == 0">Проекты отсутсвуют</option>
        <option v-for="project in props.projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
      <button
          class="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-[20px]"
          @click="openAddProjectModal"
      >Создать новый проект</button>
      <button
          class="mb-2 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition mb-[20px]"
          @click="removeActiveProject"
      >Удалить проект</button>
    </div>

    <span class="font-semibold mb-2">Фильтры</span>
    <div class="border rounded p-2 w-full max-w-sm bg-white mb-5">
      <ul>
        <li
            v-for="status in statuses"
            :key="status.value"
            @click="toggleStatus(status.value)"
            :class="[
          'cursor-pointer py-1 px-2  select-none',
          localStatusFilter.includes(status.value) ? 'bg-gray-600 text-white' : 'hover:bg-gray-200'
        ]"
        >
          {{ status.label }}
        </li>
      </ul>
    </div>
    <input
        v-model="localNameFilter"
        type="text"
        placeholder="Поиск по имени..."
        @input="onNameFilterChange(localNameFilter)"
        class="border rounded px-3 py-2 text-gray-700 w-full mb-[20px]"
    />
      <div class="w-full">
        <label class="block font-semibold mb-1">Фильтр по тегам</label>
        <input
            type="text"
            v-model="input"
            @focus="dropdownOpen = true"
            @blur="onInputBlur"
            placeholder="Введите тег..."
            class="w-full border rounded p-2 mb-2"
            autocomplete="off"
            ref="tagInputRef"
        />

        <ul
            v-show="dropdownOpen && filteredTags.length > 0"
            class="absolute border rounded max-h-40 overflow-auto mb-2 bg-white shadow w-[calc(100%-20px)]"
        >
          <li
              v-for="tag in filteredTags"
              :key="tag"
              @mousedown.prevent="addTag(tag)"
              class="cursor-pointer px-3 py-1 hover:bg-blue-500 hover:text-white"
          >
            {{ tag }}
          </li>
        </ul>

        <div class="flex flex-wrap gap-2">
          <span
              v-for="tag in tagFilter"
              :key="tag"
              class="bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer select-none"
              @click="removeTag(tag)"
              title="Нажмите, чтобы удалить"
          >
            {{ tag }} &times;
          </span>
        </div>
      </div>
    <button
        @click="clearFilters"
        class="mt-auto mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
    >
      Очистить фильтры
    </button>
  </div>
</template>