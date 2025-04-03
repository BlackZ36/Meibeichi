import { useState } from "react";

export default function ImageHover({ width, height, imgUrl, isHoverable }) {
  const [isHovering, setIsHovering] = useState(isHoverable);

  return (
    <div className={`relative ${isHoverable ? "z-50" : "z-20"}`}>
      {/* Thumbnail image */}
      <div
        className="relative border border-gray-200 rounded-md overflow-hidden cursor-pointer transition-transform duration-200 hover:shadow-lg hover:scale-[3]"
        onMouseEnter={() => isHoverable && setIsHovering(true)}
        onMouseLeave={() => isHoverable && setIsHovering(false)}
      >
        <img
          src={imgUrl || "/placeholder.svg"}
          width={width || 300}
          height={height || 200}
          alt="Thumbnail img"
          className="object-cover"
        />
      </div>
    </div>
  );
}

