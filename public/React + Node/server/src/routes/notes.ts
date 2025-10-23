import { Router } from 'express';
import { Note } from '../types/Note';

const router = Router();

// In-memory storage (we'll replace this with a database later)
let notes: Note[] = [
  {
    id: 1,
    title: 'Welcome Note',
    content: 'This is your first note!',
    createdAt: new Date()
  },
  {
    id: 2,
    title: 'Learning React',
    content: 'React is a JavaScript library for building user interfaces.',
    createdAt: new Date()
  }
];

let nextId = 3;

// GET /api/notes - Get all notes
router.get('/', (req, res) => {
  res.json(notes);
});

// POST /api/notes - Create a new note
router.post('/', (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const newNote: Note = {
    id: nextId++,
    title,
    content,
    createdAt: new Date()
  };
  
  notes.push(newNote);
  res.status(201).json(newNote);
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes.splice(noteIndex, 1);
  res.status(204).send();
});

// PUT /api/notes/:id - Update a note
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    title,
    content
  };
  
  res.json(notes[noteIndex]);
});

export default router;
