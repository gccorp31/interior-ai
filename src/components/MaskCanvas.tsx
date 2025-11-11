"use client";

import { useEffect, useRef, useState } from "react";

type MaskCanvasProps = {
  imageUrl: string;
  onMaskComplete?: (maskDataUrl: string) => void;
  width?: number;
  height?: number;
};

/**
 * Composant Canvas pour dessiner un masque sur une image (pour l'inpainting)
 */
export default function MaskCanvas({
  imageUrl,
  onMaskComplete,
  width = 512,
  height = 512,
}: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Charger l'image de fond
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Redimensionner le canvas pour correspondre à l'image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Créer une couche de masque (semi-transparente)
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (onMaskComplete && canvasRef.current) {
      // Convertir le canvas en image de masque (noir et blanc)
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvasRef.current.width;
      maskCanvas.height = canvasRef.current.height;
      const maskCtx = maskCanvas.getContext("2d");
      if (maskCtx) {
        // Créer un masque binaire (noir = zone à inpaint, blanc = zone à garder)
        maskCtx.fillStyle = "white";
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        // Copier les zones dessinées en noir
        const imageData = canvasRef.current.getContext("2d")?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (imageData) {
          for (let i = 0; i < imageData.data.length; i += 4) {
            // Si le pixel est semi-transparent (zone dessinée), le mettre en noir
            if (imageData.data[i + 3] > 128) {
              imageData.data[i] = 0; // R
              imageData.data[i + 1] = 0; // G
              imageData.data[i + 2] = 0; // B
              imageData.data[i + 3] = 255; // A
            }
          }
          maskCtx.putImageData(imageData, 0, 0);
        }
        
        const maskDataUrl = maskCanvas.toDataURL("image/png");
        onMaskComplete(maskDataUrl);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Rouge semi-transparent pour la zone à inpaint
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Taille du pinceau: {brushSize}px
        </label>
        <input
          type="range"
          min="10"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="relative border border-zinc-300 rounded-lg overflow-hidden dark:border-zinc-700">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full h-auto"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Dessinez sur l'image pour sélectionner la zone à transformer (inpainting)
      </p>
    </div>
  );
}


