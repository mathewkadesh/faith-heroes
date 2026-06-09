const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

async function saveUpload(folder, file, forcedExt = null) {
  const cleanFolder = String(folder || 'general').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const ext = forcedExt || (file.originalname.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '');
  const dir = path.join(uploadsRoot, cleanFolder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);
  return `/uploads/${cleanFolder}/${filename}`;
}

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
    const url = await saveUpload(req.body.folder || 'general', req.file);
    res.json({ success: true, url });
  } catch (err) { next(err); }
};

exports.uploadModel = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
    const url = await saveUpload(req.body.folder || 'characters', req.file, 'glb');
    res.json({ success: true, url });
  } catch (err) { next(err); }
};

exports.uploadStoryImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
    const url = await saveUpload('story-images', req.file);
    res.json({ success: true, url });
  } catch (err) { next(err); }
};
