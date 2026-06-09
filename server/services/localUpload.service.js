const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

async function saveBuffer(folder, fileBuffer, mimetype) {
  const cleanFolder = String(folder || 'general').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const ext = (String(mimetype || '').split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  const dir = path.join(uploadsRoot, cleanFolder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), fileBuffer);
  return `/uploads/${cleanFolder}/${filename}`;
}

module.exports = { saveBuffer };
