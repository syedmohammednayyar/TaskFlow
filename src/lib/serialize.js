// Prisma returns plain JS objects with `id` (not `_id`); no .toObject() needed.

function serializeUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, avatar: u.avatar };
}

export function serializeTask(t) {
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
    createdBy: serializeUser(t.createdBy),
    assignedTo: serializeUser(t.assignedTo),
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : null,
  };
}

export function serializeComment(c) {
  if (!c) return null;
  return {
    id: c.id,
    taskId: c.taskId || null,
    body: c.body,
    editedAt: c.editedAt ? new Date(c.editedAt).toISOString() : null,
    author: serializeUser(c.author),
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null,
  };
}

export function serializeNotification(n) {
  if (!n) return null;
  return {
    id: n.id,
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    task: n.taskId || null,
    actor: serializeUser(n.actor),
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
  };
}
