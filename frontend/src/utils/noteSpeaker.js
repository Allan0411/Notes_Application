import AsyncStorage from '@react-native-async-storage/async-storage';

export async function handleReadAloud({
  note,
  speakingNoteId,
  setSpeakingNoteId,
  fetchFullNoteById,
  setNotesList,
  speak,
  stop
}) {
  try {
    if (speakingNoteId === note.id) {
      stop();
      setSpeakingNoteId(null);
      return;
    }

    stop();

    let fullNote = note;

    const fetched = await fetchFullNoteById(fullNote.id);
    if (fetched) {
      fullNote = fetched;
      setNotesList && setNotesList(prev =>
        prev.map(n => n.id === fullNote.id ? fullNote : n)
      );
    } else {
      try {
        const localRaw = await AsyncStorage.getItem('notes_local') || await AsyncStorage.getItem('NOTES');
        const parsed = localRaw ? JSON.parse(localRaw) : null;
        if (parsed) {
          const found = parsed.find(n => n.id === fullNote.id || n._id === fullNote.id);
          if (found) {
            fullNote = {
              id: found.id ?? found._id ?? null,
              title: found.title ?? '',
              textContents: fullNote.textContents ?? fullNote.text ?? '',
              checklistItems: Array.isArray(found.checklistItems) ? found.checklistItems : [],
              drawings: Array.isArray(found.drawings) ? found.drawings : [],
              createdAt: found.createdAt ?? found.created_at ?? null,
              updatedAt: found.updatedAt ?? found.updated_at ?? null,
              ...found,
            };
            setNotesList && setNotesList(prev =>
              prev.map(n => n.id === fullNote.id ? fullNote : n)
            );
          }
        }
      } catch (err) {
        // Ignore local fallback errors
      }
    }
  

    // Build TTS content
    const contentParts = [];

    if (fullNote.title && String(fullNote.title).trim()) {
      contentParts.push(fullNote.title.trim());
    }
    const body = (fullNote.textContents && String(fullNote.textContents).trim()) ? fullNote.textContents.trim()
      : (fullNote.text && String(fullNote.text).trim()) ? fullNote.text.trim()
      : '';

    if (body) {
      contentParts.push(body);
    }

    // Robust checklist array handling (array or JSON string):
    let checklistArray = [];
    if (Array.isArray(fullNote.checklistItems)) {
      checklistArray = fullNote.checklistItems;
    } else if (
      typeof fullNote.checklistItems === 'string' &&
      fullNote.checklistItems.trim().startsWith('[')
    ) {
      try {
        checklistArray = JSON.parse(fullNote.checklistItems);
      } catch (e) {
        checklistArray = [];
      }
    }
    if (checklistArray.length > 0) {
      const checklistStrings = checklistArray.map((it, idx) => {
        const t = it && (it.text ?? it.title) ? (it.text ?? it.title) : '';
        const checked = it && (it.checked === true || it.isChecked === true);
        return t
          ? `${idx + 1}. ${t}${checked ? ' (completed)' : ' (not completed)'}`
          : null;
      }).filter(Boolean);

      if (checklistStrings.length) {
        contentParts.push('Checklist: ' + checklistStrings.join('. '));
      }
    }
    
    // --- FIX APPLIED HERE ---
    let drawingsArray = [];
    if (Array.isArray(fullNote.drawings)) {
      drawingsArray = fullNote.drawings;
    } else if (
      typeof fullNote.drawings === 'string' &&
      fullNote.drawings.trim().startsWith('[')
    ) {
      try {
        drawingsArray = JSON.parse(fullNote.drawings);
      } catch (e) {
        drawingsArray = [];
      }
    }
    
    if (drawingsArray.length > 0) {
      // Change the message to a more general "a drawing" or "multiple drawings"
      const drawingCount = drawingsArray.length;
      const drawingMessage = drawingCount === 1 ? 'a drawing' : `${drawingCount} drawings`;
      contentParts.push(`This note contains ${drawingMessage}.`);
    }

    // Optionally include last updated timestamp
    const updatedAt = fullNote.updatedAt || fullNote.createdAt || null;
    if (updatedAt) {
      try {
        const d = new Date(updatedAt);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          contentParts.push(`Last updated on ${dateStr} at ${timeStr}`);
        }
      } catch (err) {
        // ignore formatting errors
      }
    }

    const content = contentParts.join('. ').trim();
    console.log('TTS content for note id', fullNote.id, ':', content);

    if (content) {
      setSpeakingNoteId && setSpeakingNoteId(fullNote.id);
      speak(content, {
        onDone: () => setSpeakingNoteId && setSpeakingNoteId(null),
        onStopped: () => setSpeakingNoteId && setSpeakingNoteId(null),
        onError: (e) => {
          console.error('Speech error:', e);
          setSpeakingNoteId && setSpeakingNoteId(null);
        },
      });
    } else {
      setSpeakingNoteId && setSpeakingNoteId(fullNote.id);
      speak('This note is empty.', {
        onDone: () => setSpeakingNoteId && setSpeakingNoteId(null),
        onStopped: () => setSpeakingNoteId && setSpeakingNoteId(null),
        onError: () => setSpeakingNoteId && setSpeakingNoteId(null),
      });
    }
  } catch (err) {
    console.error('handleReadAloud error:', err);
    setSpeakingNoteId && setSpeakingNoteId(null);
  }
}