<script setup lang="ts">

import Task from "../components/Task.vue";
import Header from "../components/Header.vue";
import FilterMenu from "../components/FilterMenu.vue";
import {computed, onMounted, ref, toRaw} from "vue";
import Modal from "../components/Modal.vue";
import { v4 as uuidv4 } from 'uuid';
import type {ProjectType, TaskType} from "../Types.ts";
import {
  addProject,
  addTaskToProject,
  getAllProjects,
  deleteProject,
  deleteTaskFromProject,
  addFilters,
  getFilters,
  getAllFilters,
  updateProject
} from '../db/indexedDB.ts';
import { encryptAES, decryptAES } from '../db/crypto.ts';

const showAddTaskModal = ref(false)
const showAddProjectModal = ref(false)
const titleAddTask = ref('')
const statusAddTask = ref<'todo' | 'in-progress' | 'done'>('todo')
const tagsAddTask = ref('')
const newProjectTitle = ref('')
const projects = ref<ProjectType[]>([])
const selectedProjectId = ref<string>('')
const statusFilter = ref<string[]>([])
const nameFilter = ref<string>("")
const tagFilter = ref<string[]>([])
const selectedTask = ref<TaskType | null>(null)
const showTaskModal = ref(false)
const showImportModal = ref(false)
const showExportModal = ref(false)


const handleImportFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const password = prompt('Введите пароль для расшифровки');
  if (!password) {
    alert('Пароль обязателен');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const encryptedText = reader.result as string;
    if (!encryptedText) {
      alert('Файл пустой');
      return;
    }
    const decrypted = decryptAES(encryptedText, password);
    if (!decrypted) {
      alert('Неверный пароль или поврежденный файл');
      return;
    }
    try {
      const importedProjects: ProjectType[] = JSON.parse(decrypted);
      projects.value = importedProjects;
      for (const project of importedProjects) {
        await addProject(project); // ваша функция добавления в IndexedDB
      }
      alert('Импорт выполнен успешно');
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      alert('Файл не содержит корректные данные');
    }
  };
  reader.onerror = () => {
    alert('Не удалось прочитать файл');
  };
  reader.readAsText(file);
};
const exportProjects = async () => {
  if (projects.value.length === 0) {
    alert('Нет проектов для экспорта');
    return;
  }
  const password = prompt('Введите пароль для шифрования');
  if (!password) {
    alert('Пароль обязателен');
    return;
  }
  try {
    const plainJSON = JSON.stringify(projects.value);
    const encrypted = encryptAES(plainJSON, password);
    const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_encrypted.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Экспорт выполнен успешно');
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    alert('Ошибка при экспорте');
  }
};
const openImportModal = () => {
  showImportModal.value = true
}
const closeImportModal = () => {
  showImportModal.value = false
}
const removeActiveProject = async () => {
  if (!selectedProjectId.value) return
  const confirmed = window.confirm('Вы действительно хотите удалить этот проект?')
  if (!confirmed) return
  try {
    await deleteProject(selectedProjectId.value);
    await loadProjects();
    if (projects.value.length === 0) {
      selectedProjectId.value = '';
      statusFilter.value = [];
      nameFilter.value = '';
      tagFilter.value = [];
    } else {
      selectedProjectId.value = projects.value[0].id;
      const savedFilters = await getFilters();
      if (savedFilters) {
        statusFilter.value = savedFilters.status || [];
        nameFilter.value = savedFilters.name || '';
        tagFilter.value = savedFilters.tag || [];
      } else {
        statusFilter.value = [];
        nameFilter.value = '';
        tagFilter.value = [];
      }
    }
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
  }
}
const openAddTaskModal = () => {
  showAddTaskModal.value = true;
}
const openAddProjectModal = () => {
  showAddProjectModal.value = true;
}
const closeAddTaskModal = () => {
  const confirmed = window.confirm('Вы действительно хотите закрыть? Все данные будут удалены.')
  if (confirmed) {
    showAddTaskModal.value = false;
  }
}
const closeAddProjectModal = () => {
  const confirmed = window.confirm('Вы действительно хотите закрыть? Все данные будут удалены.')
  if (confirmed) {
    showAddProjectModal.value = false;
  }
}
const loadProjects = async () => {
  projects.value = await getAllProjects()
}
const addNewProject = async () => {
  if (newProjectTitle.value.trim() !== '') {
    const project: ProjectType = {
      id: uuidv4(),
      name: newProjectTitle.value,
      tasks: []
    }
    await addProject(project)
    await loadProjects();
    showAddProjectModal.value = false;
    newProjectTitle.value = ''
  }
}
const availableTags = computed(() => {
  const project = projects.value.find(p => p.id === selectedProjectId.value)
  if (!project) return []
  const tagsSet = new Set<string>()
  project.tasks.forEach(task => {
    task.tags.forEach(tag => {
      tagsSet.add(tag)
    })
  })
  return Array.from(tagsSet)
})
const onSubmitTask = async () => {
  if (!titleAddTask.value.trim()) return
  const enteredTags = tagsAddTask.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  const uniqueTags = Array.from(new Set(enteredTags));
  const newTask: TaskType = {
    id: uuidv4(),
    title: titleAddTask.value.trim(),
    status: statusAddTask.value,
    tags: uniqueTags,
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await addTaskToProject(selectedProjectId.value, newTask)
  await loadProjects()
  // addTaskToSelectedProject(newTask)
  showAddTaskModal.value = false;
  titleAddTask.value = ''
  statusAddTask.value = 'todo'
  tagsAddTask.value = ''
}
const saveFilters = async () => {
  await addFilters(
      selectedProjectId.value,
      toRaw(statusFilter.value),
      toRaw(nameFilter.value),
      toRaw(tagFilter.value)
  )
}
const filteredTasks = computed(() => {
  const project = projects.value.find(p => p.id === selectedProjectId.value);
  if (!project) return [];
  return project.tasks.filter(task => {
    const statusMatch = statusFilter.value.length === 0 || statusFilter.value.includes(task.status);
    const nameMatch = nameFilter.value.trim() === '' || task.title.toLowerCase().includes(nameFilter.value.trim().toLowerCase());
    const tagMatch = tagFilter.value.length === 0 || task.tags.some(tag => tagFilter.value.includes(tag));
    return statusMatch && nameMatch && tagMatch;
  });
});
const handleDeleteTask = async (taskId: string) => {
  if (!selectedProjectId.value) {
    alert('Проект не выбран');
    return;
  }
  const confirmed = window.confirm('Вы точно хотите удалить эту задачу?');
  if (!confirmed) return;

  try {
    await deleteTaskFromProject(selectedProjectId.value, taskId);
    await loadProjects();
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    alert('Не удалось удалить задачу');
  }
}
const updateTask = async (updatedTask: TaskType) => {
  const projectIndex = projects.value.findIndex(p => p.id === selectedProjectId.value);
  if (projectIndex === -1) return;
  const taskIndex = projects.value[projectIndex].tasks.findIndex(t => t.id === updatedTask.id);
  if (taskIndex === -1) return;
  projects.value[projectIndex].tasks[taskIndex] = updatedTask;
  projects.value = [...projects.value];
  const updatedProject = toRaw(projects.value[projectIndex])
  await updateProject(updatedProject);
}
onMounted(async () => {
  await loadProjects()
  const filters = await getAllFilters();
  console.log(filters);
  if (filters.length > 0) {
    selectedProjectId.value = filters[0].projectId;
    const savedFilters = await getFilters();
    if (savedFilters) {
      statusFilter.value = savedFilters.status || [];
      nameFilter.value = savedFilters.name || '';
      tagFilter.value = savedFilters.tag || [];
    }
  } else if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id;
  }
})
</script>

<template class="w-full">
  <Header
      :openModal="openAddTaskModal"
      :openImportModal="openImportModal"
      :exportProjects="exportProjects"/>
  <body class="flex w-full">
    <div class="basis-1/5">
      <FilterMenu
          @openAddProject="openAddProjectModal"
          @removeActiveProject="removeActiveProject"

          :projects="projects"
          :selectedProjectId="selectedProjectId"

          :availableTags="availableTags"
          :statusFilter="statusFilter"
          :nameFilter="nameFilter"
          :tagFilter="tagFilter"

          @update:selectedProjectId="async (val) => { selectedProjectId = val; await saveFilters() }"
          @update:statusFilter="async (val) => { statusFilter = val; await saveFilters() }"
          @update:nameFilter="async (val) => { nameFilter = val; await saveFilters() }"
          @update:tagFilter="async (val) => { tagFilter = val; await saveFilters() }"
      />
    </div>
    <div class="sidebar basis-4/5 flex flex-wrap gap-4 mt-[20px]">
      <!-- Модальное окно для добавления задачи -->
      <Modal
          v-if="showAddTaskModal"
          @close="closeAddTaskModal"
      >
        <div
          class="w-full"
        >
          <form @submit.prevent class="space-y-4 p-4 bg-white rounded  w-full max-w-md">
            <div>
              <label for="title" class="block mb-1 font-medium">Название задачи</label>
              <input
                  id="title"
                  type="text"
                  v-model="titleAddTask"
                  required
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название задачи"
              />
            </div>

            <div>
              <label for="status" class="block mb-1 font-medium">Статус</label>
              <select
                  id="status"
                  v-model="statusAddTask"
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label for="tags" class="block mb-1 font-medium">Теги (через запятую)</label>
              <input
                  id="tags"
                  type="text"
                  v-model="tagsAddTask"
                  placeholder="work, personal"
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="closeAddTaskModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Отмена</button>
<!--              <button type="submit" @click="addTask" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>-->
              <button type="submit" @click="onSubmitTask" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
            </div>
          </form>
        </div>
      </Modal>
      <!-- Модальное окно для добавления проекта     -->
      <Modal
          v-if="showAddProjectModal"
          @close="closeAddProjectModal"
      >
        <form @submit.prevent="addNewProject">
<!--        <form >-->
          <h3>Создание проекта</h3>
            <input
                v-model="newProjectTitle"
                required
                placeholder="Введите название проекта"
                class="border rounded px-3 py-2 text-gray-700 w-full mb-[20px]"
            />
          <div>
            <button
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-[20px]"

            >Создать</button>
            <button
                class="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition mr-[20px]"
                @click="closeAddProjectModal"
            >Отмена</button>
          </div>
        </form>
      </Modal>
      <!-- Модальное окно для Импорта -->
      <Modal 
        v-if="showImportModal" 
        @close="closeImportModal
      ">
        <input type="file" @change="handleImportFile" accept=".txt" />
        <button @click="closeImportModal">Отмена</button>
      </Modal>
      <!-- Проверка на наличие задач в проекте -->
      <div v-if="filteredTasks.length>0">
          <Task
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            class="w-[300px]"
            @update:task="updateTask"
            @delete="handleDeleteTask"
          />
      </div>
      <div v-else> 
        <h3 class="text-white">Задачи отсутствуют</h3>
      </div>
      <!-- ---------------------------------- -->

    </div>
  </body>
</template>
