import { CheckCircle, Circle, Clock } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Order Confirmed', desc: 'Your order has been placed' },
  { key: 'confirmed', label: 'Payment Received', desc: 'Payment has been processed' },
  { key: 'printing', label: 'Being Crafted', desc: 'Your gift box is being handcrafted' },
  { key: 'shipped', label: 'Packed & Dispatched', desc: 'Your order is on its way' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Your package is nearby' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your Faith Heroes gift box!' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'printing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTimeline({ status, timestamps = {} }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div className={`relative z-10 rounded-full flex items-center justify-center w-8 h-8 ${
                isDone ? 'bg-green-700' : isActive ? 'bg-gold animate-pulse-gold' : 'bg-card border border-gold/20'
              }`}>
                {isDone
                  ? <CheckCircle size={18} className="text-white" />
                  : isActive
                  ? <Clock size={16} className="text-dark-text" />
                  : <Circle size={16} className="text-muted/30" />
                }
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-10 mt-1 ${isDone ? 'bg-green-700' : 'border-l border-dashed border-gold/20'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-8">
              <p className={`text-sm font-semibold ${isDone || isActive ? 'text-cream' : 'text-muted'}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted mt-0.5">{step.desc}</p>
              {timestamps[step.key] && (
                <p className="text-xs text-gold mt-1">
                  {new Date(timestamps[step.key]).toLocaleString('en-GB')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
