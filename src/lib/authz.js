// With Prisma, IDs are CUIDs (plain strings). Any non-empty string is valid.
export function isValidObjectId(id) {
  return typeof id === "string" && id.trim().length > 0;
}

// task must have createdById / assignedToId (raw FK fields from Prisma)
export function canViewTask(task, userId) {
  return task.createdById === userId || task.assignedToId === userId;
}

export function isTaskCreator(task, userId) {
  return task.createdById === userId;
}
