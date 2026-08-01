import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
