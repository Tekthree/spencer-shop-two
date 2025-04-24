import Link from "next/link";

/**
 * Home page for Spencer Grey Artist Website
 * Features a minimalist hero section and gallery grid inspired by Roburico.com
 * @returns Home page component
 */
export default function Home() {
  // Reason: Using placeholder data until connected to Supabase
  const featuredArtworks = [
    {
      id: "featured-1",
      title: "Serenity in Blue",
      price: "from $175.00",
      image: "/placeholder-art-1.jpg",
    },
    {
      id: "featured-2",
      title: "Horizon Lines",
      price: "from $175.00",
      image: "/placeholder-art-2.jpg",
    }
  ];

  // Reason: Using placeholder data until connected to Supabase
  const recentArtworks = [
    { id: "art-1", title: "Horizon Lines", tag: "Just Dropped", image: "/placeholder-art-2.jpg" },
    { id: "art-2", title: "Geometric Study #4", tag: "Newest Addition", image: "/placeholder-art-3.jpg" },
    { id: "art-3", title: "Monochrome Waves", tag: "Most Popular", image: "/placeholder-art-4.jpg" },
    { id: "art-4", title: "Abstract Composition", tag: "Must-Have", image: "/placeholder-art-5.jpg" },
  ];

  return (
    <div className="min-h-screen">
      {/* Minimal Hero Section - "gallery vibes. at home." */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl mb-20 max-w-3xl">
            gallery vibes. at home.
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {featuredArtworks.map((artwork) => (
              <div key={artwork.id} className="space-y-3">
                <Link href={`/artwork/${artwork.id}`}>
                  {/* Placeholder image - replace with actual artwork */}
                  <div className="aspect-[4/5] w-full bg-gray-100 flex items-center justify-center mb-6">
                    <span className="text-gray-400 font-serif italic">Artwork</span>
                  </div>
                </Link>
                <div className="flex flex-col items-start">
                  <Link href={`/artwork/${artwork.id}`} className="font-serif text-xl hover:underline">
                    {artwork.title}
                  </Link>
                  <span className="text-sm">{artwork.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Statement Section */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl leading-relaxed mb-12">
            Art transcends mere visual perception—it's about the emotions it evokes. I'm Spencer Grey, 
            an artist focused on creating minimalist works that invite contemplation and connection.
          </h2>
          <Link href="/about" className="text-sm underline underline-offset-4">
            @spencergrey
          </Link>
        </div>
      </section>

      {/* Featured Works - Horizontal Scroll on Mobile */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {recentArtworks.map((artwork) => (
              <div key={artwork.id} className="space-y-4">
                <Link href={`/artwork/${artwork.id}`} className="block">
                  <div className="aspect-[4/5] w-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="text-gray-400 font-serif italic">Artwork</span>
                  </div>
                </Link>
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1">{artwork.tag}</div>
                  <Link href={`/artwork/${artwork.id}`} className="font-serif text-lg hover:underline">
                    {artwork.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Value Propositions */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
              <span className="font-serif">1</span>
            </div>
            <h3 className="font-serif text-xl">Limited Prints</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Each piece of art is part of an exclusive, limited edition collection. 
              Once sold out, they will never be printed again, making every print a rare addition to your collection.
            </p>
            <Link 
              href="/shop"
              className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
              <span className="font-serif">2</span>
            </div>
            <h3 className="font-serif text-xl">Museum Quality</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Each print is crafted with the highest quality in mind. Using premium paper and the giclée printing process, 
              we guarantee rich, vibrant colors and a level of detail that will last for generations.
            </p>
            <Link 
              href="/shop"
              className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
              <span className="font-serif">3</span>
            </div>
            <h3 className="font-serif text-xl">Print To Order</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every print is made-to-order, meaning it's freshly printed once you place your order. 
              This allows us to minimize waste and stay true to our commitment to sustainability.
            </p>
            <Link 
              href="/shop"
              className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Artist Quote */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-6">
            "My works explore the beauty of simplicity and the power of negative space. 
            I believe that art should create a moment of pause in our busy lives—a chance to 
            breathe and reflect on what truly matters."
          </blockquote>
          <cite className="text-sm font-medium not-italic">Spencer Grey</cite>
        </div>
      </section>
    </div>
  );
}