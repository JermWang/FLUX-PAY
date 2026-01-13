import Link from "next/link";
import { Logo } from "./logo";

export const Header = () => {
  return (
    <div className="fixed z-50 pt-8 md:pt-14 top-0 left-0 w-full">
      <header className="flex items-center justify-between container mx-auto px-4 md:px-8">
        <Link href="/">
          <Logo className="w-[100px] md:w-[120px]" />
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          <Link
            className="uppercase inline-block font-mono text-white/60 hover:text-white duration-150 transition-colors ease-out"
            href="/send"
          >
            App
          </Link>
          <Link
            className="uppercase inline-block font-mono text-white/60 hover:text-white duration-150 transition-colors ease-out"
            href="/docs"
          >
            Docs
          </Link>
        </nav>
        <Link
          className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-[#FFC700] hover:text-[#FFC700]/80"
          href="/send"
        >
          Launch App
        </Link>
      </header>
    </div>
  );
};
