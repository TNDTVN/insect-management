// Tạo component ImageWithFallback
const ImageWithFallback = ({ src, alt, className, fallbackSrc = '/placeholder-image.jpg' }) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

// Sử dụng trong species grid
<ImageWithFallback
  src={`http://localhost:8000/public/species_images/${sp.image_path}`}
  alt={sp.name_vi}
  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
  fallbackSrc="/placeholder-image.jpg"
/>