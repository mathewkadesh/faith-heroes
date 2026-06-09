import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Crown, MousePointer, RotateCcw, RotateCw, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThreeViewer from './ThreeViewer';

export default function ThreeViewerModal({ isOpen, onClose, character, onAddToCart }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const navigate = useNavigate();

  if (!character) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0A0505]/98 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#8B1A1A]/40 bg-[#180C0C]"
          >
            <header className="flex items-center justify-between border-b border-[#8B1A1A]/20 p-5">
              <div className="flex items-center gap-2">
                <Box size={18} className="text-[#C9A84C]" />
                <h3 className="font-display text-lg font-bold text-[#FDF5F0]">{character.name} - 3D Figure Preview</h3>
              </div>
              <button onClick={onClose} className="text-[#FDF5F0]/45 transition hover:text-[#FDF5F0]"><X size={20} /></button>
            </header>

            <div className="relative h-[400px] bg-[#0A0505]">
              {character.model_3d_url ? (
                <ThreeViewer modelUrl={character.model_3d_url} autoRotate={autoRotate} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-[#0A0505]">
                  <div className="landing-spin-slow flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-[#8B1A1A]/40">
                    <Crown size={48} className="text-[#C9A84C]/40" />
                  </div>
                  <p className="mt-6 text-sm text-[#FDF5F0]/30">3D model coming soon</p>
                  <p className="mt-2 text-xs text-[#FDF5F0]/20">Upload a .glb file in the admin dashboard</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#8B1A1A]/20 p-4">
              <p className="flex items-center gap-1.5 text-xs text-[#FDF5F0]/30"><MousePointer size={12} /> Drag to rotate - Scroll to zoom</p>
              <div className="flex gap-2">
                <button onClick={() => setAutoRotate(value => !value)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${autoRotate ? 'border-[#8B1A1A] bg-[#8B1A1A] text-[#FDF5F0]' : 'border-[#8B1A1A]/40 bg-[#8B1A1A]/20 text-[#FDF5F0]/70'}`}>
                  <RotateCw size={12} /> Auto Rotate
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1A1A]/30 px-3 py-1.5 text-xs text-[#FDF5F0]/50">
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            <footer className="flex gap-3 border-t border-[#8B1A1A]/20 bg-[#0A0505] p-4">
              <button onClick={onAddToCart} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8B1A1A] px-6 py-2.5 text-sm text-[#FDF5F0]">
                <ShoppingCart size={15} /> Add to Cart
              </button>
              <button onClick={() => { onClose(); navigate(`/shop/${character.id}`); }} className="rounded-full border border-[#C9A84C]/40 px-6 py-2.5 text-sm text-[#C9A84C]">
                View Product
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
