function Footer() {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <p className="mb-2 text-white font-bold text-xl">Destiny Mission Global Assembly</p>
          <p className="text-purple-300 text-sm italic mb-4 max-w-2xl mx-auto">To bring people and places into their destiny in God and raise dynamic leaders</p>
          <div className="h-px w-32 bg-purple-600 mx-auto my-6"></div>
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Destiny Mission Global Assembly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

