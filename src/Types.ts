export interface TaskType {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    tags: string[];
    subtasks: TaskType[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectType {
    id: string;
    name: string;
    tasks: TaskType[];
}
