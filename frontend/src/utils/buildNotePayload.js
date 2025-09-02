export function buildNotePayload(note) {
  // Build the formatting object if any formatting fields are present
  let formatting = undefined;
  if (
    note.fontSize !== undefined ||
    note.fontFamily !== undefined ||
    note.isBold !== undefined ||
    note.isItalic !== undefined ||
    note.textAlign !== undefined ||
    (note.formattedRanges && Array.isArray(note.formattedRanges) && note.formattedRanges.length > 0)
  ) {
    formatting = {
      fontSize: note.fontSize,
      fontFamily: note.fontFamily,
      isBold: note.isBold,
      isItalic: note.isItalic,
      textAlign: note.textAlign,
    };
    if (note.formattedRanges && Array.isArray(note.formattedRanges)) {
      formatting.ranges = note.formattedRanges;
    }
  }

  // Build the payload to match the .NET Note model
  const payload = {
    // id is not sent on create, but may be sent on update
    ...(note.id !== undefined ? { id: note.id } : {}),

    title: note.title ?? null,
    textContents: note.textContents ?? null,
    drawings: note.drawings
      ? (typeof note.drawings === "string"
          ? note.drawings
          : JSON.stringify(note.drawings))
      : null,
    checklistItems: note.checklistItems
      ? (typeof note.checklistItems === "string"
          ? note.checklistItems
          : JSON.stringify(note.checklistItems))
      : null,
    formatting: formatting ? JSON.stringify(formatting) : null,

    // .NET expects DateTime? for createdAt and lastAccessed
    createdAt: note.createdAt ? new Date(note.createdAt).toISOString() : null,
    lastAccessed: note.lastAccessed ? new Date(note.lastAccessed).toISOString() : null,

    isArchived: !!note.isArchived,
    isPrivate: !!note.isPrivate,

    // creatorUserId is required and int
    creatorUserId: note.creatorUserId !== undefined && note.creatorUserId !== null
      ? Number(note.creatorUserId)
      : 0,

    // version for concurrency control
    version: note.version !== undefined && note.version !== null
      ? Number(note.version)
      : 1,

    // lastChangedBy is required (string)
    lastChangedBy: note.lastChangedBy ?? "",
  };

  return payload;
}


export async function updatedMergePayload(updatedPayload, latestNote) {
  const merged = { ...latestNote };

  // Helper to parse JSON safely
  function parseField(val) {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }

  // Merge TEXT -> append changes
  if (updatedPayload.textContents !== undefined) {
    const latestText = latestNote.textContents || "";
    const updatedText = updatedPayload.textContents || "";

    if (latestText.trim() && updatedText.trim()) {
      merged.textContents = `${latestText}\n\n*******Your changes**********\n ${updatedText}`;
    } else if (updatedText.trim()) {
      merged.textContents = updatedText;
    } else {
      merged.textContents = latestText;
    }
  }

  // Merge checklistItems (union merge)
  if (updatedPayload.checklistItems !== undefined) {
    const updatedList = parseField(updatedPayload.checklistItems) || [];
    const latestList = parseField(latestNote.checklistItems) || [];

    const combined = [...latestList];

    for (const item of updatedList) {
      const exists = combined.some(l => l.text?.trim() === item.text?.trim());
      if (!exists) {
        combined.push(item);
      }
    }

    merged.checklistItems = JSON.stringify(combined);
  }

  // Drawings -> keep base only (ignore updated)
  if (latestNote.drawings !== undefined) {
    merged.drawings = latestNote.drawings;
  }

  // Formatting -> just overwrite with latest
  if (latestNote.formatting !== undefined) {
    merged.formatting = latestNote.formatting;
  }

  // Always prefer latest simple fields
  const simpleFields = [
    "title", "fontSize", "fontFamily", "isBold", "isItalic", "textAlign",
    "isArchived", "isPrivate", "creatorUserId", "lastChangedBy",
    "updatedAt", "createdAt", "lastAccessed"
  ];

  for (const key of simpleFields) {
    merged[key] = latestNote[key] ?? updatedPayload[key];
  }

  // Keep latest version
  if (typeof latestNote.version === "number") {
    merged.version = latestNote.version;
  }

  console.log("Updated payload: ", updatedPayload);
  console.log("Latest note: ", latestNote);
  console.log("Merged result: ", merged);

  return merged;
}

