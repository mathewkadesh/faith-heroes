import { useEffect, useState } from 'react';
import { BookOpen, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { storyAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    setLoading(true);
    try {
      const response = await storyAPI.getPending();
      setStories(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load stories');
      setStories([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      if (status === 'approved') await storyAPI.approve(id);
      else await storyAPI.reject(id, '');
      toast.success(`Story ${status}`);
      fetchStories();
    } catch (error) {
      toast.error(error.message || 'Could not update story');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-cream font-bold">Community Stories</h2>
        <p className="text-muted text-sm mt-1">Review submissions before they appear on the landing page.</p>
      </div>

      {loading ? (
        <div className="bg-card border border-gold/10 rounded-xl p-10 text-center text-muted">Loading stories...</div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stories.map(story => (
            <article key={story.id} className="bg-card border border-gold/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-cream font-semibold">{story.story_title || 'Untitled story'}</h3>
                    <p className="text-xs text-muted">{story.character_name || 'No character'} · {story.bible_reference || 'No reference'}</p>
                  </div>
                </div>
                <Badge variant={story.status === 'approved' ? 'green' : story.status === 'rejected' ? 'red' : 'gold'}>
                  {story.status}
                </Badge>
              </div>
              <p className="text-sm text-muted leading-relaxed line-clamp-5">{story.story_content}</p>
              <p className="text-xs text-muted mt-4">Submitted by {story.profiles?.full_name || 'Anonymous'}</p>
              {story.status === 'pending' && (
                <div className="flex gap-3 mt-5">
                  <Button variant="gold" size="sm" onClick={() => updateStatus(story.id, 'approved')}>
                    <Check size={15} className="mr-1" /> Approve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(story.id, 'rejected')}>
                    <X size={15} className="mr-1" /> Reject
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-gold/10 rounded-xl p-10 text-center text-muted">No story submissions yet.</div>
      )}
    </div>
  );
}
