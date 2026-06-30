import { cn } from '@/lib/utils';

const TIER_STYLES = {
  Bronze:   'bg-gradient-to-br from-[#CD7F32] to-[#8A5A2B] text-white',
  Silver:   'bg-gradient-to-br from-[#C0C0C0] to-[#71797E] text-white',
  Gold:     'bg-gradient-to-br from-[#F5A623] to-[#B87C11] text-white',
  Platinum: 'bg-gradient-to-br from-[#E5E4E2] to-[#808080] text-[#0A1628]',
};

export default function TierBadge({ tier, size = 'md' }) {
  if (!tier) return null;
  const cls = TIER_STYLES[tier.name] || TIER_STYLES.Bronze;
  const sizeCls = size === 'lg'
    ? 'px-3 py-1.5 text-[11px]'
    : size === 'sm'
    ? 'px-2 py-0.5 text-[9px]'
    : 'px-2.5 py-1 text-[10px]';
  return (
    <span
      data-testid={`tier-badge-${tier.name}`}
      className={cn('inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-lg', cls, sizeCls)}
    >
      ★ {tier.name}
    </span>
  );
}
