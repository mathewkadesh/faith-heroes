const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');

async function ensureBucket(bucket) {
  const { error } = await supabase.storage.getBucket(bucket);
  if (!error) return;

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
  });

  if (createError && !/already exists/i.test(createError.message || '')) {
    throw createError;
  }
}

async function uploadToStorage(bucket, filename, buffer, mimetype) {
  await ensureBucket(bucket);
  const { error } = await supabase.storage
    .from(bucket).upload(filename, buffer, { contentType: mimetype, upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
  return publicUrl;
}

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const ext = req.file.originalname.split('.').pop();
    const folder = String(req.body.folder || 'general').replace(/[^a-z0-9-]/gi, '').toLowerCase();
    const url = await uploadToStorage('character-images', `${folder}/${randomUUID()}.${ext}`, req.file.buffer, req.file.mimetype);
    res.json({ success: true, url });
  } catch (err) { next(err); }
};

exports.uploadModel = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const folder = String(req.body.folder || 'characters').replace(/[^a-z0-9-]/gi, '').toLowerCase();
    const url = await uploadToStorage('models-3d', `${folder}/${randomUUID()}.glb`, req.file.buffer, 'model/gltf-binary');
    res.json({ success: true, url });
  } catch (err) { next(err); }
};

exports.uploadStoryImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const ext = req.file.originalname.split('.').pop();
    const url = await uploadToStorage('story-images', `${randomUUID()}.${ext}`, req.file.buffer, req.file.mimetype);
    res.json({ success: true, url });
  } catch (err) { next(err); }
};
