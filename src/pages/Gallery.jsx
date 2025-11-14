import { useState } from 'react'
import { Link } from 'react-router-dom'

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  const galleryImages = [
    { src: '/images/gallery/gImage1.jpg', caption: 'Sunday Worship Service' },
    { src: '/images/gallery/gImage2.jpg', caption: 'Youth Ablaze Conference' },
    { src: '/images/gallery/gImage3.jpg', caption: 'Water Baptism' },
    { src: '/images/gallery/gImage4.jpg', caption: 'Community Outreach' },
    { src: '/images/gallery/gImage5.jpg', caption: 'All-Night Prayer' },
    { src: '/images/gallery/gImage6.jpg', caption: 'Christmas Carol Service' },
    { src: '/images/gallery/gImage7.jpg', caption: 'Annual Harvest Crusade' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-16 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Church Gallery
          </h1>
          <p className="text-xl opacity-90">Moments of Faith, Fellowship & Joy</p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.src}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold text-center px-4">
                    {image.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.caption}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4 text-xl">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default Gallery
