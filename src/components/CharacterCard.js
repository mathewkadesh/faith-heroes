import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Box } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import ThreeViewer from './ThreeViewer';
import { Modal } from './ui/Modal';
import { assetUrl } from '../lib/assets';

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const imageUrl = assetUrl(character.figure_image_url || character.lid_image_url || character.box_image_url);

  return (
    <>
      <div className="bg-card rounded-2xl border border-gold/15 overflow-hidden flex flex-col group hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
        <div className="relative h-52 overflow-hidden bg-[#120907]">
          {imageUrl
            ? <img src={imageUrl} alt={character.name}
                className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={40} className="text-gold/30" />
              </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl text-cream font-semibold leading-tight">{character.name}</h3>
            {character.bible_reference && (
              <Badge variant="gold" className="flex-shrink-0">{character.bible_reference}</Badge>
            )}
          </div>

          {character.tagline && (
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">{character.tagline}</p>
          )}

          {character.scripture_quote && (
            <p className="text-muted text-sm leading-relaxed italic line-clamp-2">
              "{character.scripture_quote}"
            </p>
          )}

          <div className="flex gap-2 mt-auto pt-2">
            <Button variant="primary" size="sm" className="flex-1"
              onClick={() => navigate(`/shop/${character.id}`)}>
              View Gift Box
            </Button>
            {character.model_3d_url && (
              <Button variant="ghost" size="sm" onClick={() => setViewerOpen(true)}>
                <Box size={15} className="mr-1" /> 3D
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={viewerOpen} onClose={() => setViewerOpen(false)}
        title={`${character.name} — 3D Preview`} size="lg">
        <div className="h-[400px] rounded-xl overflow-hidden bg-bg">
          <ThreeViewer modelUrl={character.model_3d_url} />
        </div>
      </Modal>
    </>
  );
}
