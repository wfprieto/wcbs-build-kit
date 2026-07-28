export class TaskStore {
  constructor(initialTasks = []) {
    this.tasks = initialTasks.map((task) => ({ ...task }));
  }

  add({ title, priority = "normal" }) {
    if (typeof title !== "string" || title.trim() === "") throw new TypeError("title is required");
    if (!['low', 'normal', 'high'].includes(priority)) throw new TypeError("invalid priority");
    const task = { id: this.tasks.length + 1, title: title.trim(), priority, completed: false };
    this.tasks.push(task);
    return { ...task };
  }

  complete(id) {
    const task = this.tasks.find((candidate) => candidate.id === id);
    if (!task) return false;
    task.completed = true;
    return true;
  }

  list({ completed } = {}) {
    return this.tasks
      .filter((task) => completed === undefined || task.completed === completed)
      .map((task) => ({ ...task }));
  }
}
