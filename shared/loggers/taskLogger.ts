import { withContext } from "@shared/loggers/logger.js";

type TaskLoggerParams = {
  taskId: string;
  displayId: string;
};

export function createTaskLogger(origin: string, task: TaskLoggerParams) {
  return withContext(origin, {
    taskId: task.taskId,
    displayId: task.displayId,
  });
}
