export function normalizeNote(n) {
    return {
      id: n.id ?? n._id ?? null,
      title: n.title ?? '',
      textContents: n.textContents ?? n.text ?? '',
      checklistItems: Array.isArray(n.checklistItems) ? n.checklistItems
        : Array.isArray(n.checklist) ? n.checklist
        : [],
      drawings: Array.isArray(n.drawings) ? n.drawings : [],
      formatting: n.formatting ?? {},
      createdAt: n.createdAt ?? n.created_at ?? null,
      updatedAt: n.updatedAt ?? n.updated_at ?? null,
      ...n
    };
  }
  