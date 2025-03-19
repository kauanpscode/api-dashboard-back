const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  channel_slug: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  fixed: {
    type: Boolean,
    default: false,
  },
});

// Criar o modelo File baseado no schema
const File = mongoose.model('File', FileSchema);

module.exports = File;
