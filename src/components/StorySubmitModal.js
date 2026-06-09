import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { storyAPI, uploadAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, BookOpen } from 'lucide-react';

export default function StorySubmitModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ character_name: '', story_title: '', bible_reference: '', story_content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to submit a story'); return; }
    setSubmitting(true);

    try {
      let submitted_image_url = null;

      if (imageFile) {
        const uploaded = await uploadAPI.uploadStoryImage(imageFile);
        submitted_image_url = uploaded.url;
      }

      await storyAPI.submit({
        user_id: user.id,
        ...form,
        submitted_image_url,
        status: 'pending',
      });
      toast.success('Thank you! Your story has been submitted for review.');
      setForm({ character_name: '', story_title: '', bible_reference: '', story_content: '' });
      setImageFile(null);
      onClose();
    } catch (err) {
      toast.error('Failed to submit story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Story" size="md">
      {!user ? (
        <div className="text-center py-8">
          <BookOpen size={48} className="text-gold/30 mx-auto mb-4" />
          <p className="text-cream font-medium mb-2">Sign in to share your story</p>
          <p className="text-muted text-sm">Join our community and inspire others with your faith journey.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Bible Character" name="character_name" placeholder="e.g. David, Noah, Esther"
            value={form.character_name} onChange={handleChange} required />
          <Input label="Story Title" name="story_title" placeholder="Give your story a title"
            value={form.story_title} onChange={handleChange} required />
          <Input label="Bible Reference" name="bible_reference" placeholder="e.g. 1 Samuel 17:45"
            value={form.bible_reference} onChange={handleChange} />
          <Textarea label="Your Story" name="story_content" placeholder="Share how this Bible story has impacted your life..."
            value={form.story_content} onChange={handleChange} rows={5} required />

          <div>
            <label className="text-sm text-muted font-medium block mb-1">Upload Image (optional)</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-gold/20 rounded-xl p-4 cursor-pointer hover:border-gold/40 transition-colors">
              <Upload size={20} className="text-gold" />
              <span className="text-sm text-muted">{imageFile ? imageFile.name : 'Click to upload an image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gold" className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Story'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
