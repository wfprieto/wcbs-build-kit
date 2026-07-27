import { TaskStore } from './task-store.mjs';

export function createTaskService(store = new TaskStore()) {
  return {
    createTask(input) {
      return store.add(input);
    },
    completeTask(id) {
      return store.complete(id);
    },
    getOpenTasks() {
      return store.list({ completed: false });
    },
    getCompletedTasks() {
      return store.list({ completed: true });
    }
  };
}
