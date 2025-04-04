import { useState } from "react";

export default function ImageHover({ width, height, imgUrl }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className={`relative`}>
      {/* Thumbnail image */}
      <div
        className="relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:shadow-lg z-10 hover:scale-[2.5] hover:z-20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img src={imgUrl || "/placeholder.svg"} width={width || 300} height={height || 200} alt="Thumbnail img" className="object-cover" />
      </div>
    </div>
  );
}
