export function buildNotePayload(note) {
  return {
    title: String(note.title ?? ''),
    textContents: String(note.textContents ?? ''),
    drawings: JSON.stringify(Array.isArray(note.drawings) ? note.drawings : []),
    checklistItems: JSON.stringify(Array.isArray(note.checklistItems) ? note.checklistItems : []),
    ...(note.fontSize || note.fontFamily || note.isBold || note.isItalic || note.textAlign
      ? {
          formatting: JSON.stringify({
            fontSize: note.fontSize,
            fontFamily: note.fontFamily,
            isBold: note.isBold,
            isItalic: note.isItalic,
            textAlign: note.textAlign,
          }),
        }
      : {}),
    isArchived: Boolean(note.isArchived),
    isPrivate: Boolean(note.isPrivate),
    ...(note.creatorUserId ? { creatorUserId: note.creatorUserId } : {}),
    updatedAt: note.updatedAt || new Date().toISOString(),
  };
}
