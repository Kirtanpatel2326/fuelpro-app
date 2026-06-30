import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    title: 'Earn points every fill-up',
    body: 'Every gallon you pump counts toward exclusive rewards. Watch your points stack up automatically.',
    img: 'https://images.pexels.com/photos/18219435/pexels-photo-18219435.png',
  },
  {
    title: 'Unlock exclusive coupons',
    body: 'Free coffee, discounted car washes, fuel savings — your wallet just got a lot more interesting.',
    img: 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg',
  },
  {
    title: 'Rise through the tiers',
    body: 'Bronze. Silver. Gold. Platinum. Each tier unlocks bigger multipliers and richer perks.',
    img: 'https://images.pexels.com/photos/32860475/pexels-photo-32860475.jpeg',
  },
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[idx];
  const last = idx === SLIDES.length - 1;

  return (
    <div className="theme-dark min-h-screen bg-fp-navy text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={slide.img} alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-fp-navy via-fp-navy/85 to-transparent" />
      </div>

      <div className="relative z-10 flex justify-end p-5">
        <button
          data-testid="onboarding-skip"
          onClick={() => navigate('/auth')}
          className="text-fp-text text-sm uppercase tracking-wider fp-press"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-10">
        <p className="text-fp-gold text-xs uppercase tracking-[0.3em] mb-3 font-semibold">
          Step {idx + 1} of {SLIDES.length}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">{slide.title}</h1>
        <p className="text-base text-white/80 leading-relaxed max-w-md">{slide.body}</p>

        <div className="flex items-center gap-2 mt-10 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? 'w-8 bg-fp-gold' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        <Button
          data-testid="onboarding-next"
          onClick={() => (last ? navigate('/auth') : setIdx(idx + 1))}
          className="w-full h-14 rounded-2xl bg-fp-gold text-fp-navy font-bold text-base hover:bg-fp-gold/90 fp-press"
        >
          {last ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
