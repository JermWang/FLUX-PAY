"use client";

import Link from "next/link";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { useState } from "react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col h-svh justify-center items-center text-white pt-[88px]" data-skin="skal">

      <div className="text-center relative z-10">
        <Pill className="mb-6">PRIVATE TRANSFERS</Pill>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-sentient">
          Untraceable <br />
          <i className="font-light">Solana</i> transfers
        </h1>
        <p className="font-mono text-sm sm:text-base text-white/60 text-balance mt-8 max-w-[440px] mx-auto">
          Zero-knowledge routing that breaks the on-chain link between sender
          and receiver.
        </p>

        <Link className="contents max-sm:hidden" href="/send">
          <Button
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Enter App]
          </Button>
        </Link>
        <Link className="contents sm:hidden" href="/send">
          <Button
            size="sm"
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Enter App]
          </Button>
        </Link>
      </div>
    </div>
  );
}
