export function buildNotePayload(note) {
  // Build the base formatting object with global formatting
  const formatting = {
    fontSize: note.fontSize,
    fontFamily: note.fontFamily,
    isBold: note.isBold,
    isItalic: note.isItalic,
    textAlign: note.textAlign,
  };

  // Add formattedRanges to the formatting object
  if (note.formattedRanges && Array.isArray(note.formattedRanges)) {
    formatting.ranges = note.formattedRanges;
  }

  return {
    title: String(note.title ?? ''),
    textContents: String(note.textContents ?? ''),
    drawings: JSON.stringify(Array.isArray(note.drawings) ? note.drawings : []),
    checklistItems: JSON.stringify(Array.isArray(note.checklistItems) ? note.checklistItems : []),
    
    // FIXED: Always include formatting object if any formatting exists
    ...(note.fontSize || note.fontFamily || note.isBold || note.isItalic || note.textAlign || 
        (note.formattedRanges && note.formattedRanges.length > 0)
      ? {
          formatting: JSON.stringify(formatting),
        }
      : {}),
    
    // save formattedRanges as a separate field for backward compatibility
    // and easier access (some systems might prefer direct access vs parsing JSON)
    ...(note.formattedRanges && Array.isArray(note.formattedRanges) && note.formattedRanges.length > 0
      ? {
          formattedRanges: JSON.stringify(note.formattedRanges),
        }
      : {}),
    
    isArchived: Boolean(note.isArchived),
    isPrivate: Boolean(note.isPrivate),
    ...(note.creatorUserId ? { creatorUserId: note.creatorUserId } : {}),
    updatedAt: note.updatedAt || new Date().toISOString(),
  };
}