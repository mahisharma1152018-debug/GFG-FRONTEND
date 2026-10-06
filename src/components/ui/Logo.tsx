import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <img
        src="/gfg-logo-transparent.png"
        alt="GeeksforGeeks"
        className="h-14 w-20 object-contain"
      />

      <span className="flex flex-col leading-none">
        <span className="font-pixel text-sm font-bold tracking-tight">
          GEEK<span className="text-mint">STOBER</span>
        </span>

        <span className="mt-0.5 font-mono text-[8px] tracking-[0.12em] text-dim">
          GFG STUDENT CHAPTER RBU
        </span>
      </span>
    </Link>
  )
}
export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <img
      src="/gfg-logo-transparent.png"
      alt="GeeksforGeeks"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  )
}