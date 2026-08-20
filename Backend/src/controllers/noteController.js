import Note from "../models/Note.js";

export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const newNote = new Note({
      title,
      content,
      userId,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const userId = req.userId;
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.userId;
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.userId;

    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};
