const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

app.post('/upload', (req, res) => {
  const { image } = req.body || {};

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'No image provided.' });
  }

  const match = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);

  if (!match) {
    return res.status(400).json({ error: 'Unsupported image format.' });
  }

  const format = match[1].toLowerCase();
  const fileExt = format === 'jpg' ? 'jpg' : format;
  const base64Data = match[2];
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFile(filePath, Buffer.from(base64Data, 'base64'), (err) => {
    if (err) {
      console.error('Save failed:', err);
      return res.status(500).json({ error: 'Failed to save image locally.' });
    }

    res.json({
      message: 'Image saved locally.',
      file: fileName,
      folder: uploadDir
    });
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Local photo demo is running.' });
});

app.listen(PORT, () => {
  console.log(`Local photo demo running at http://localhost:${PORT}`);
});
