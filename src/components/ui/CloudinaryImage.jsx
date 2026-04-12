import Image from 'next/image'

/**
 * CloudinaryImage — wrapper around next/image for Cloudinary URLs
 * Falls back to a purple placeholder if src is missing
 */
export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '100vw',
  className = '',
  priority = false,
  ...props
}) {
  const fallback = `https://placehold.co/${width || 800}x${height || 600}/4a148c/ffb300?text=DMGA`
  const imgSrc = src || fallback

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt || 'DMGA'}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
        priority={priority}
        {...props}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt || 'DMGA'}
      width={width}
      height={height}
      className={className}
      priority={priority}
      {...props}
    />
  )
}
