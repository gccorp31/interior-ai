"use client";

import Image from "next/image";

type WatermarkImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  hasWatermark?: boolean;
};

/**
 * Composant pour afficher une image avec ou sans watermark
 * Si hasWatermark est true, un watermark est ajouté pour les utilisateurs anonymes
 */
export default function WatermarkImage({
  src,
  alt,
  width,
  height,
  className = "",
  hasWatermark = false,
}: WatermarkImageProps) {
  if (hasWatermark) {
    return (
      <div className="relative inline-block">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-xs font-medium text-white">
          MonDécorateurIA
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}


