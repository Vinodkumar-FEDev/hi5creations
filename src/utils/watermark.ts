export interface WatermarkOptions {
  enabled?: boolean;
  phone?: string; // e.g. "+91 63792 39878"
  instagram?: string; // e.g. "#hi5_Creation"
  brandText?: string; // e.g. "Hi-5 CREATION"
  logoUrl?: string; // Custom logo image URL
  position?: "corners" | "tiled";
  style?: "corners" | "tiled";
  opacity?: number;
  whiteBackground?: boolean; // Solid white background card for corners (default true)
  maxDimension?: number; // 0 for Original Native Resolution (no downscaling)
  quality?: number; // 0.95 for maximum crisp clarity
}

export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  enabled: true,
  phone: "+91 63792 39878",
  instagram: "#hi5_Creation",
  brandText: "Hi-5 CREATION",
  logoUrl: "/assets/logo.png",
  position: "corners",
  style: "corners",
  opacity: 0.95,
  whiteBackground: true,
  maxDimension: 0, // Original native resolution preserve
  quality: 0.95, // 95% High fidelity quality preservation
};

/**
 * Draws a crisp solid white card with subtle drop shadow and refined border.
 */
function drawWhiteCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  scale: number
): void {
  ctx.save();
  // 1. Soft realistic drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = Math.round(10 * scale);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(3 * scale);

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // 2. Crisp subtle outer border
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(203, 213, 225, 0.95)"; // Slate-300 clean crisp border
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.stroke();

  ctx.restore();
}

/** Draw Vector Green Phone Icon */
function drawPhoneIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const path = new Path2D(
    "M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.02 21 3 13.98 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.27 1.11l-2.37 2.4z"
  );
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = "#16a34a"; // Green 600
  ctx.fill(path);
  ctx.restore();
}

/** Draw Vector Instagram Icon (Pink/Red Gradient) */
function drawInstagramIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const path = new Path2D(
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
  );
  ctx.scale(size / 24, size / 24);
  const grad = ctx.createLinearGradient(0, 0, 24, 24);
  grad.addColorStop(0, "#e1306c");
  grad.addColorStop(0.5, "#fd1d1d");
  grad.addColorStop(1, "#f77737");
  ctx.fillStyle = grad;
  ctx.fill(path);
  ctx.restore();
}

/** Draw 3D Hi-5 CREATION Official Logo at Bottom-Right Corner */
function drawHi5OfficialLogo(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  scale: number,
  brandText = "Hi-5 CREATION",
  customLogoImg?: HTMLImageElement,
  whiteBackground = true
) {
  if (customLogoImg) {
    const w = Math.round(180 * scale);
    const h = Math.round(
      ((customLogoImg.naturalHeight || customLogoImg.height) /
        (customLogoImg.naturalWidth || customLogoImg.width)) *
        w
    );

    if (whiteBackground) {
      const padX = Math.round(14 * scale);
      const padY = Math.round(12 * scale);
      const boxW = Math.round(w + padX * 2);
      const boxH = Math.round(h + padY * 2);
      const boxX = rx - boxW;
      const boxY = ry - boxH;
      const radius = Math.round(8 * scale);

      drawWhiteCard(ctx, boxX, boxY, boxW, boxH, radius, scale);
      ctx.drawImage(customLogoImg, boxX + padX, boxY + padY, w, h);
    } else {
      ctx.drawImage(customLogoImg, rx - w, ry - h, w, h);
    }
    return;
  }

  // Fallback vector logo
  const logoW = Math.round(180 * scale);
  const logoH = Math.round(75 * scale);

  let lx = rx - logoW;
  let ly = ry - logoH;

  if (whiteBackground) {
    const padX = Math.round(14 * scale);
    const padY = Math.round(12 * scale);
    const boxW = Math.round(logoW + padX * 2);
    const boxH = Math.round(logoH + padY * 2);
    const boxX = rx - boxW;
    const boxY = ry - boxH;
    const radius = Math.round(8 * scale);

    drawWhiteCard(ctx, boxX, boxY, boxW, boxH, radius, scale);
    lx = boxX + padX;
    ly = boxY + padY;
  }

  ctx.save();
  // 1. Draw 5-Finger High-Five Hand Emblem
  const handX = lx + 120 * scale;
  const handY = ly + 2 * scale;
  const fingerW = 6.5 * scale;
  const fingerHeights = [24 * scale, 30 * scale, 34 * scale, 28 * scale, 20 * scale];

  fingerHeights.forEach((fh, i) => {
    const fx = handX + i * 8.5 * scale;
    const fy = handY + (34 * scale - fh);
    ctx.beginPath();
    ctx.roundRect(fx, fy, fingerW, fh, fingerW / 2);
    ctx.fillStyle = i % 2 === 0 ? "#dc2626" : "#f97316";
    ctx.fill();
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  });

  // 2. Draw "Hi-5" 3D Yellow-Orange Gradient Text with Red 3D Extrusion
  const mainFont = `900 ${Math.round(36 * scale)}px sans-serif, system-ui`;
  ctx.font = mainFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const textX = lx;
  const textY = ly;

  // Red 3D Extrusion Shadow
  ctx.fillStyle = "#991b1b";
  ctx.fillText("Hi-5", textX + 3 * scale, textY + 3 * scale);
  ctx.fillStyle = "#dc2626";
  ctx.fillText("Hi-5", textX + 1.5 * scale, textY + 1.5 * scale);

  // Main Fill (Yellow-Orange Gradient)
  const grad = ctx.createLinearGradient(textX, textY, textX, textY + 36 * scale);
  grad.addColorStop(0, "#fef08a");
  grad.addColorStop(0.5, "#facc15");
  grad.addColorStop(1, "#f97316");
  ctx.fillStyle = grad;
  ctx.fillText("Hi-5", textX, textY);

  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeText("Hi-5", textX, textY);

  // 3. Draw "CREATION" Text
  const subFont = `900 ${Math.round(18 * scale)}px sans-serif, system-ui`;
  ctx.font = subFont;
  const subY = textY + 38 * scale;

  ctx.fillStyle = "#991b1b";
  ctx.fillText("CREATION", textX + 1.5 * scale, subY + 1.5 * scale);

  const subGrad = ctx.createLinearGradient(textX, subY, textX + 100 * scale, subY);
  subGrad.addColorStop(0, "#ef4444");
  subGrad.addColorStop(0.5, "#facc15");
  subGrad.addColorStop(1, "#f97316");
  ctx.fillStyle = subGrad;
  ctx.fillText("CREATION", textX, subY);

  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 1 * scale;
  ctx.strokeText("CREATION", textX, subY);

  ctx.restore();
}

/**
 * Draws the automatic watermark onto HTML5 Canvas.
 * Top-Left:
 *   - Solid White Square Card: Name (Brand/Company), Mobile Number (+ Phone Icon), Instagram Handle
 * Bottom-Right:
 *   - Solid White Square Card: Official Hi-5 CREATION Logo
 */
export function drawWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions = {},
  logoImg?: HTMLImageElement
): void {
  const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
  if (opts.enabled === false) return;

  const {
    phone = "+91 63792 39878",
    instagram = "#hi5_Creation",
    brandText = "Hi-5 CREATION",
    position = "corners",
    style = "corners",
    opacity = 0.95,
    whiteBackground = true,
  } = opts;

  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, opacity));

  const scale = Math.max(0.65, Math.min(width, height) / 800);
  const padding = Math.round(24 * scale);

  // Style 1: Diagonal Tiled Mode
  if (style === "tiled" || position === "tiled") {
    ctx.rotate((-25 * Math.PI) / 180);
    const tileFont1 = Math.round(18 * scale);
    const tileFont2 = Math.round(14 * scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 2 * scale;
    ctx.textAlign = "center";

    const stepX = Math.round(320 * scale);
    const stepY = Math.round(180 * scale);

    for (let x = -width * 2; x < width * 2; x += stepX) {
      for (let y = -height * 2; y < height * 2; y += stepY) {
        ctx.font = `900 ${tileFont1}px sans-serif, system-ui`;
        ctx.strokeText(phone, x, y);
        ctx.fillText(phone, x, y);

        ctx.font = `800 ${tileFont2}px sans-serif, system-ui`;
        ctx.strokeText(instagram, x, y + tileFont1 + 4 * scale);
        ctx.fillText(instagram, x, y + tileFont1 + 4 * scale);
      }
    }
    ctx.restore();
    return;
  }

  // Style 2: Official Corners Mode (Top-Left Contact Card + Bottom-Right Logo Square)
  if (whiteBackground !== false) {
    ctx.save();
    const nameFont = `900 ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
    const phoneFont = `bold ${Math.round(13 * scale)}px system-ui, -apple-system, sans-serif`;
    const instaFont = `bold ${Math.round(12.5 * scale)}px system-ui, -apple-system, sans-serif`;

    const iconSize = Math.round(15 * scale);
    const iconGap = Math.round(8 * scale);

    ctx.font = nameFont;
    const nameW = brandText ? ctx.measureText(brandText).width + Math.round(14 * scale) : 0;

    ctx.font = phoneFont;
    const phoneW = phone ? iconSize + iconGap + ctx.measureText(phone).width : 0;

    ctx.font = instaFont;
    const instaW = instagram ? iconSize + iconGap + ctx.measureText(instagram).width : 0;

    const contentW = Math.max(nameW, phoneW, instaW);
    const padX = Math.round(14 * scale);
    const padY = Math.round(11 * scale);
    const topBoxW = Math.round(contentW + padX * 2);

    const nameH = brandText ? Math.round(18 * scale) : 0;
    const phoneH = phone ? Math.round(18 * scale) : 0;
    const instaH = instagram ? Math.round(18 * scale) : 0;
    const lineGap = Math.round(6 * scale);

    let totalContentH = 0;
    if (nameH > 0) totalContentH += nameH;
    if (phoneH > 0) totalContentH += (totalContentH > 0 ? lineGap : 0) + phoneH;
    if (instaH > 0) totalContentH += (totalContentH > 0 ? lineGap : 0) + instaH;

    const topBoxH = Math.round(totalContentH + padY * 2);
    const topBoxX = padding;
    const topBoxY = padding;
    const topRadius = Math.round(8 * scale);

    // Draw Top-Left Solid White Card
    drawWhiteCard(ctx, topBoxX, topBoxY, topBoxW, topBoxH, topRadius, scale);

    // Draw Content inside Top-Left White Card
    let curY = topBoxY + padY;

    // A. Name Line (Brand / Company Name)
    if (brandText) {
      ctx.font = nameFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      // Small orange accent dot
      ctx.beginPath();
      ctx.arc(
        topBoxX + padX + Math.round(3.5 * scale),
        curY + nameH / 2,
        Math.round(3.5 * scale),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#f97316";
      ctx.fill();

      // Brand name text in crisp slate-900
      ctx.fillStyle = "#0f172a";
      ctx.fillText(brandText, topBoxX + padX + Math.round(12 * scale), curY + nameH / 2);

      curY += nameH + (phoneH > 0 || instaH > 0 ? lineGap : 0);
    }

    // B. Mobile Number Line
    if (phone) {
      const pIconY = curY + Math.round((phoneH - iconSize) / 2);
      drawPhoneIcon(ctx, topBoxX + padX, pIconY, iconSize);

      ctx.font = phoneFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(phone, topBoxX + padX + iconSize + iconGap, curY + phoneH / 2);

      curY += phoneH + (instaH > 0 ? lineGap : 0);
    }

    // C. Instagram Line
    if (instagram) {
      const iIconY = curY + Math.round((instaH - iconSize) / 2);
      drawInstagramIcon(ctx, topBoxX + padX, iIconY, iconSize);

      ctx.font = instaFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e11d48";
      ctx.fillText(instagram, topBoxX + padX + iconSize + iconGap, curY + instaH / 2);
    }
    ctx.restore();

    // 2. Bottom-Right: Hi-5 Logo with White Card
    drawHi5OfficialLogo(
      ctx,
      width - padding,
      height - padding,
      scale,
      brandText,
      logoImg,
      true
    );
  } else {
    // Legacy transparent mode
    const iconSize = Math.round(22 * scale);
    const fontSize = Math.round(18 * scale);
    const lineGap = Math.round(32 * scale);
    ctx.font = `800 ${fontSize}px sans-serif, system-ui`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textX = padding + iconSize + Math.round(10 * scale);

    const y1 = padding + iconSize / 2;
    drawPhoneIcon(ctx, padding, padding, iconSize);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3.5 * scale;
    ctx.strokeText(phone, textX, y1);
    ctx.fillStyle = "#0f172a";
    ctx.fillText(phone, textX, y1);

    const y2 = padding + lineGap + iconSize / 2;
    drawInstagramIcon(ctx, padding, padding + lineGap, iconSize);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3.5 * scale;
    ctx.strokeText(instagram, textX, y2);
    ctx.fillStyle = "#dc2626";
    ctx.fillText(instagram, textX, y2);

    drawHi5OfficialLogo(
      ctx,
      width - padding,
      height - padding,
      scale,
      brandText,
      logoImg,
      false
    );
  }

  ctx.restore();
}

/**
 * Applies automatic watermark to an image File and returns a watermarked WebP File.
 */
export function applyWatermarkToImageFile(
  file: File,
  options: WatermarkOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
  const maxDim = opts.maxDimension !== undefined ? opts.maxDimension : 0;
  const quality = opts.quality !== undefined ? opts.quality : 0.95;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (maxDim > 0 && (width > maxDim || height > maxDim)) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw base image
      ctx.drawImage(img, 0, 0, width, height);

      // Load official logo image (defaults to /assets/logo.png)
      const targetLogoUrl = opts.logoUrl || "/assets/logo.png";
      let logoImg: HTMLImageElement | undefined = undefined;
      if (targetLogoUrl) {
        try {
          logoImg = await new Promise<HTMLImageElement>((resLogo, rejLogo) => {
            const lImg = new Image();
            lImg.crossOrigin = "anonymous";
            lImg.onload = () => resLogo(lImg);
            lImg.onerror = () => rejLogo();
            lImg.src = targetLogoUrl;
          });
        } catch {}
      }

      // Draw automatic watermark
      if (opts.enabled !== false) {
        drawWatermarkOnCanvas(ctx, width, height, opts, logoImg);
      }

      // Export as high-quality WebP image
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const cleanName =
              file.name.replace(/\.[^/.]+$/, "").replace(/_watermarked$/, "") +
              "_watermarked.webp";
            const watermarkedFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
