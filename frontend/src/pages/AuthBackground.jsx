export default function AuthBackground({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#070A09] relative overflow-hidden flex items-center justify-center p-6">
      {/* Logo-themed neon lime & emerald mesh gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(212,248,46,0.34),transparent_46%),radial-gradient(circle_at_82%_78%,rgba(16,185,129,0.30),transparent_48%),radial-gradient(circle_at_78%_18%,rgba(163,230,53,0.24),transparent_42%),radial-gradient(circle_at_22%_82%,rgba(52,211,153,0.20),transparent_45%)]"
      />

      {/* Glowing ambient orbs in logo shades */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full bg-[#D4F82E]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#10B981]/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[26rem] w-[26rem] rounded-full bg-[#A3E635]/15 blur-3xl" />

      {/* Background watermark: exact staggered forward-slanted FF mark + capitalized FocusFlow */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 flex items-center justify-center overflow-hidden px-6"
      >
        <div className="flex items-center justify-center gap-1.5 md:gap-2.5">
          {/* Vector FF emblem matching reference geometry */}
          <svg
            viewBox="12 8 154 182"
            className="w-24 sm:w-32 md:w-44 lg:w-52 h-auto shrink-0 opacity-90 drop-shadow-[0_0_24px_rgba(212,248,46,0.25)]"
            fill="none"
          >
            {/* Left taller pill slanted right */}
            <g transform="rotate(11 56 100)">
              <rect x="26" y="10" width="58" height="176" rx="29" fill="#D4F82E" />
              <path
                d="M42 74H71V85H54V97H68V108H54V131H42V74Z"
                fill="#0D1610"
                transform="rotate(-11 56 102)"
              />
            </g>

            {/* Right shorter pill slanted right, bottom-aligned */}
            <g transform="rotate(11 128 118)">
              <rect x="98" y="46" width="58" height="140" rx="29" fill="#D4F82E" />
              <path
                d="M114 91H143V102H126V114H140V125H126V148H114V91Z"
                fill="#0D1610"
                transform="rotate(-11 128 119)"
              />
            </g>
          </svg>

          {/* Large capitalized FocusFlow wordmark */}
          <div className="text-[11vw] leading-none font-bold tracking-tight flex items-baseline">
            <span className="text-[#D4F82E]/90">Focus</span>
            <span className="text-zinc-200/75">Flow</span>
          </div>
        </div>
      </div>

      {/* Foreground card */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
