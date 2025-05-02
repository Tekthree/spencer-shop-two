/**
 * ArtworkCard component for Spencer Grey Artist Website
 * Displays a preview of an artwork with title, year, and edition information
 */
import Link from 'next/link';
// Note: Image component will be needed when real artwork images are available

interface ArtworkCardProps {
  id: string;
  title: string;
  // image parameter is defined but not used yet - will be used when real images are available
  // image: string;
  year: number;
  editions: number;
  editionsSold: number;
}

export default function ArtworkCard({ id, title, year, editions, editionsSold }: ArtworkCardProps) {
  // Reason: Using placeholder div for now, will use image parameter with Image component when real images are available
  return (
    <Link href={`/artwork/${id}`} className="group block">
      <div className="bg-white border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-md">
        <div className="aspect-[4/5] w-full relative">
          {/* Placeholder div until real images are available */}
          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
            <span className="text-gray-400 font-serif italic">{title}</span>
          </div>
          
          {/* Uncomment when real images are available */}
          {/* <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          /> */}
        </div>
        
        <div className="p-4">
          <h3 className="font-serif text-xl">{title}</h3>
          <p className="text-sm text-gray-500">{year}</p>
          <p className="text-xs mt-2">Edition: {editionsSold} / {editions}</p>
        </div>
      </div>
    </Link>
  );
}
