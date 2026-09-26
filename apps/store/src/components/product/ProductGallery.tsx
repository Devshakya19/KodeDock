"use client";

import React, { useState } from "react";

interface ProductGalleryProps {
  mainThumbnail: string;
  previewImages?: string[];
  productTitle: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainThumbnail,
  previewImages = [],
  productTitle,
}) => {
  // Combine main thumbnail and preview images into a unique list
  const allImages = React.useMemo(() => {
    const list = [mainThumbnail, ...(previewImages || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [mainThumbnail, previewImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = allImages[activeIndex] || mainThumbnail || "/kd.svg";

  return (
    <div>
      {/* Main 16:9 Gallery Viewer */}
      <div className="gallery-viewer-main">
        <img
          src={activeImage}
          alt={`${productTitle} - Preview ${activeIndex + 1}`}
          className="gallery-viewer-img"
        />
      </div>

      {/* Thumbnails Strip (Epic Games Style) */}
      {allImages.length > 1 && (
        <div className="gallery-thumbnails-strip">
          {allImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`gallery-thumb-btn${idx === activeIndex ? " active" : ""}`}
              aria-label={`Switch to preview ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="gallery-thumb-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
