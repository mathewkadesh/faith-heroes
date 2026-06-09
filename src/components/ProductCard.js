import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useCart } from '../context/CartContext';
import { assetUrl } from '../lib/assets';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const character = product.characters;
  const imageUrl = assetUrl(character?.figure_image_url || character?.lid_image_url || character?.box_image_url);

  const stockVariant = product.is_preview ? 'gold' : product.stock_qty > 10 ? 'green' : product.stock_qty > 0 ? 'yellow' : 'red';
  const stockLabel = product.is_preview ? 'Coming Soon' : product.stock_qty > 10 ? 'In Stock' : product.stock_qty > 0 ? `Only ${product.stock_qty} left` : 'Out of Stock';

  function handleAddToCart() {
    addItem({
      product_id: product.id,
      name: product.name || character?.name,
      unit_price: product.price,
      quantity: 1,
      image_url: imageUrl,
      character_name: character?.name,
    });
    toast.success(`${character?.name || product.name} added to cart!`);
  }

  return (
    <div className="bg-card rounded-2xl border border-gold/15 overflow-hidden group hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 flex flex-col">
      <div className="relative h-56 overflow-hidden bg-[#120907] cursor-pointer" onClick={() => navigate(`/shop/${character?.id || product.character_id}`)}>
        {imageUrl
          ? <img src={imageUrl} alt={character?.name || product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-gold/20" />
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <Badge variant={stockVariant} className="absolute top-3 right-3">{stockLabel}</Badge>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display text-lg text-cream font-semibold leading-tight">
            {product.name || `${character?.name} Gift Box`}
          </h3>
          {character?.bible_reference && (
            <p className="text-xs text-gold mt-1">{character.bible_reference}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p className="font-display text-2xl text-gold font-bold">
            {product.is_preview ? 'Preview' : `£${Number(product.price).toFixed(2)}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1"
            onClick={() => navigate(`/shop/${character?.id || product.character_id}`)}>
            View Details
          </Button>
          <Button variant="gold" size="sm" className="flex-1" disabled={product.is_preview || product.stock_qty === 0}
            onClick={handleAddToCart}>
            <ShoppingBag size={14} className="mr-1.5" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
