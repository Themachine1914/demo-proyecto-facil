import type { ImgHTMLAttributes } from 'react'
// TEMPLATE: CLIENT-SPECIFIC — replace src/assets/logo.png with the client brand.
import logo from '../../assets/logo.png'

interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  height?: number
}

export function Logo({ height = 32, className = '', ...props }: LogoProps) {
  return (
    <img
      src={logo}
      alt='Demo "proyecto facil"'
      height={height}
      className={`w-auto object-contain ${className}`}
      style={{ height }}
      {...props}
    />
  )
}
