// Shown on the payment result screen when the payment succeeded.

export function OrderSuccessCard({ onTrackPackage, onViewHistory }) {
  return (
    <div className="w-full rounded-2xl border-[1.5px] border-[#E7DDD5] bg-gradient-to-br from-white to-[#FAFAF9] px-6 py-7 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.08)]">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#15803D] shadow-[0_0_0_3px_rgba(21,128,61,0.15)]" aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#15803D]">Order Confirmed</span>
      </div>
      <h3 className="mb-1.5 text-[1.05rem] font-extrabold tracking-tight text-[#0F172A]">You&apos;re all set!</h3>
      <p className="mb-5 text-[13px] leading-relaxed text-[#78716C]">
        We&apos;ve started preparing your order. You can track its progress or browse your full order history any time.
      </p>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onViewHistory}
          className="flex-1 rounded-[10px] border-[1.5px] border-[#E7DDD5] bg-white py-3 text-[13.5px] font-bold text-[#0F172A] transition hover:bg-[#F7F5F2] active:scale-[0.97]"
        >
          History
        </button>
        <button
          type="button"
          onClick={onTrackPackage}
          className="flex-1 rounded-[10px] bg-[#0F172A] py-3 text-[13.5px] font-bold text-white transition hover:opacity-90 active:scale-[0.97]"
        >
          Track my package
        </button>
      </div>
    </div>
  )
}
