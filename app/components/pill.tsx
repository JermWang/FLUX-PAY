import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { px } from "./utils";

export const Pill = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const polyRoundness = 6;
  const hypotenuse = polyRoundness * 2;
  const hypotenuseHalf = polyRoundness / 2 - 1.5;

  return (
    <div
      style={{
        "--poly-roundness": px(polyRoundness),
      } as CSSProperties}
      className={cn(
        "bg-[#262626]/50 transform-gpu font-medium text-white/50 backdrop-blur-sm font-mono text-sm inline-flex items-center justify-center px-3 h-8 border border-[#424242] [clip-path:polygon(var(--poly-roundness)_0,calc(100%_-_var(--poly-roundness))_0,100%_var(--poly-roundness),100%_calc(100%_-_var(--poly-roundness)),calc(100%_-_var(--poly-roundness))_100%,var(--poly-roundness)_100%,0_calc(100%_-_var(--poly-roundness)),0_var(--poly-roundness))]",
        className
      )}
    >
      <span
        style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as CSSProperties}
        className="absolute inline-block w-[var(--h)] top-[var(--hh)] left-[var(--hh)] h-[2px] -rotate-45 origin-top -translate-x-1/2 bg-[#424242]"
      />
      <span
        style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as CSSProperties}
        className="absolute w-[var(--h)] top-[var(--hh)] right-[var(--hh)] h-[2px] bg-[#424242] rotate-45 translate-x-1/2"
      />
      <span
        style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as CSSProperties}
        className="absolute w-[var(--h)] bottom-[var(--hh)] left-[var(--hh)] h-[2px] bg-[#424242] rotate-45 -translate-x-1/2"
      />
      <span
        style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as CSSProperties}
        className="absolute w-[var(--h)] bottom-[var(--hh)] right-[var(--hh)] h-[2px] bg-[#424242] -rotate-45 translate-x-1/2"
      />

      <span className="inline-block size-2.5 rounded-full bg-[#FFC700] mr-2 shadow-[0_0_8px_2px_rgba(255,199,0,0.5)]" />

      {children}
    </div>
  );
};
