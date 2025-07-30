import type { TaskType, ProjectType } from "../Types";
import {toRaw} from "vue";

const DB_NAME = 'ToDoDB';
const DB_VERSION = 5;
const STORE_NAME = 'projects';
const FILTER_STORE_NAME = 'filters';


function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // Хранение проектов
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            // Хранение фильтров
            if (!db.objectStoreNames.contains(FILTER_STORE_NAME)) {
                db.createObjectStore(FILTER_STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function restoreTasksDates(tasks: any[]): TaskType[] {
    return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        subtasks: task.subtasks ? restoreTasksDates(task.subtasks) : [],
    }));
}

export async function addProject(project: ProjectType): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(project);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAllProjects(): Promise<ProjectType[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();
        request.onsuccess = () => {
            const projects = request.result.map((project: any) => ({
                ...project,
                tasks: restoreTasksDates(project.tasks),
            })) as ProjectType[];
            resolve(projects);
            return(projects)
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProject(projectId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(projectId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function updateProject(updatedProject: ProjectType): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(updatedProject);
        request.onsuccess = () => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        }
        request.onerror = () => reject(request.error);
    })
}

export async function addTaskToProject(projectId: string, newTask: TaskType): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Получаем проект по key = projectId
        const getRequest = store.get(projectId);

        getRequest.onsuccess = () => {
            const project: ProjectType | undefined = getRequest.result;

            if (!project) {
                reject(new Error(`Project with id ${projectId} not found`));
                return;
            }

            // Если tasks нет — создаём пустой массив
            if (!Array.isArray(project.tasks)) {
                project.tasks = [];
            }

            // Добавляем новую задачу
            project.tasks.push(newTask);

            // Обновляем проект в базе
            const putRequest = store.put(project);

            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}

export async function deleteTaskFromProject(projectId: string, taskId: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Получаем проект по ключу projectId
        const getRequest = store.get(projectId);

        getRequest.onsuccess = () => {
            const project: ProjectType | undefined = getRequest.result;

            if (!project) {
                reject(new Error(`Project with id ${projectId} not found`));
                return;
            }

            if (!Array.isArray(project.tasks)) {
                project.tasks = [];
            }

            // Удаляем задачу по taskId из массива задач
            const originalLength = project.tasks.length;
            project.tasks = project.tasks.filter(task => task.id !== taskId);

            if (project.tasks.length === originalLength) {
                // Задача с указанным ID не найдена - можно промис тоже отклонить или просто резолвить
                // reject(new Error(`Task with id ${taskId} not found in project ${projectId}`));
                // return;
            }

            // Обновляем проект в базе
            const putRequest = store.put(project);

            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}
export async function addFilters(
    activeProjectId: string,
    statusFilter: string[],
    nameFilter: string,
    tagFilter: string[]
): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(FILTER_STORE_NAME, 'readwrite');
        const store = tx.objectStore(FILTER_STORE_NAME);
        const data = toRaw({
            id: 1,
            projectId: activeProjectId,
            status: statusFilter,
            name: nameFilter,
            tag: tagFilter
        })
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getFilters(): Promise<{
    projectId: string,
    status: string[],
    name: string,
    tag: string[]
} | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(FILTER_STORE_NAME, 'readonly');
        const store = tx.objectStore(FILTER_STORE_NAME);
        // const request = store.get(projectId);
        const request = store.get(1);
        request.onsuccess = () => {
            if(request.result) {
                resolve(request.result);
            } else {
                resolve(null);
            }
        }
        request.onerror = () => reject(request.error);
    });
}

export async function getAllFilters(): Promise<
    Array<{ projectId: string; status: string[]; name: string; tag: string[] }>
> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(FILTER_STORE_NAME, 'readonly');
        const store = tx.objectStore(FILTER_STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            resolve(request.result || []);
        };
        request.onerror = () => reject(request.error);
    });
}