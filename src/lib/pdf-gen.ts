import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;

function oklchToRgb(l: number, c: number, h: number, alpha?: string): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;

  const r = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const b_ = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;

  const toSRGB = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? Math.round(clamped * 12.92 * 255)
      : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.05) * 255);
  };

  const R = toSRGB(r);
  const G = toSRGB(g);
  const B = toSRGB(b_);

  if (alpha !== undefined) {
    let parsedAlpha = 1;
    if (alpha.endsWith("%")) {
      parsedAlpha = parseFloat(alpha.slice(0, -1)) / 100;
    } else {
      parsedAlpha = parseFloat(alpha);
    }
    if (isNaN(parsedAlpha)) parsedAlpha = 1;
    return `rgba(${R}, ${G}, ${B}, ${parsedAlpha})`;
  }

  return `rgb(${R}, ${G}, ${B})`;
}

function convertOklchColorString(str: string): string {
  if (!str || !str.includes("oklch")) return str;

  return str.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
    const parts = p1.trim().split(/[\s,\/]+/);
    if (parts.length >= 3) {
      const l = parseFloat(parts[0]);
      const c = parseFloat(parts[1]);
      const h = parseFloat(parts[2]);
      const alpha = parts[3];
      if (!isNaN(l) && !isNaN(c) && !isNaN(h)) {
        return oklchToRgb(l, c, h, alpha);
      }
    }
    return match;
  });
}

export async function nodeToPdfBlob(node: HTMLElement): Promise<Blob> {
  const originalGetComputedStyle = window.getComputedStyle;

  // 1. Temporary monkeypatch of getComputedStyle to catch and convert oklch during the inlining phase
  window.getComputedStyle = function (elt, pseudoElt) {
    const style = originalGetComputedStyle.call(this, elt, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        const val = Reflect.get(target, prop);
        if (typeof val === "function") {
          return function (...args: any[]) {
            const result = val.apply(target, args);
            if (prop === "getPropertyValue" && typeof result === "string") {
              return convertOklchColorString(result);
            }
            return result;
          };
        }
        if (typeof val === "string") {
          return convertOklchColorString(val);
        }
        return val;
      },
    });
  };

  let iframe: HTMLIFrameElement | null = null;

  try {
    // 2. Recursively capture and inline all computed styles on the node tree
    const elements = [node, ...Array.from(node.querySelectorAll("*"))] as HTMLElement[];
    const computedStyles = elements.map((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        borderTopColor: computed.borderTopColor,
        borderRightColor: computed.borderRightColor,
        borderBottomColor: computed.borderBottomColor,
        borderLeftColor: computed.borderLeftColor,
        borderWidth: computed.borderWidth,
        borderStyle: computed.borderStyle,
        borderCollapse: computed.borderCollapse,
        borderSpacing: computed.borderSpacing,
        padding: computed.padding,
        margin: computed.margin,
        display: computed.display,
        flexDirection: computed.flexDirection,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        gap: computed.gap,
        flex: computed.flex,
        width: computed.width,
        height: computed.height,
        minWidth: computed.minWidth,
        minHeight: computed.minHeight,
        maxWidth: computed.maxWidth,
        maxHeight: computed.maxHeight,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        textTransform: computed.textTransform,
        letterSpacing: computed.letterSpacing,
        lineHeight: computed.lineHeight,
        position: computed.position,
        top: computed.top,
        right: computed.right,
        bottom: computed.bottom,
        left: computed.left,
        zIndex: computed.zIndex,
        opacity: computed.opacity,
        transform: computed.transform,
        transformOrigin: computed.transformOrigin,
        boxSizing: computed.boxSizing,
        borderRadius: computed.borderRadius,
        fontFamily: computed.fontFamily,
        boxShadow: computed.boxShadow,
        objectFit: computed.objectFit,
        whiteSpace: computed.whiteSpace,
        gridTemplateColumns: computed.gridTemplateColumns,
        gridTemplateRows: computed.gridTemplateRows,
        gridColumn: computed.gridColumn,
        gridRow: computed.gridRow,
        gridArea: computed.gridArea,
        gridColumnStart: computed.gridColumnStart,
        gridColumnEnd: computed.gridColumnEnd,
        gridRowStart: computed.gridRowStart,
        gridRowEnd: computed.gridRowEnd,
        gridAutoFlow: computed.gridAutoFlow,
        gridAutoColumns: computed.gridAutoColumns,
        gridAutoRows: computed.gridAutoRows,
        columnGap: computed.columnGap,
        rowGap: computed.rowGap,
        justifySelf: computed.justifySelf,
        alignSelf: computed.alignSelf,
        pointerEvents: computed.pointerEvents,
      };
    });

    // Apply captured styles as explicit inline styles
    elements.forEach((el, index) => {
      const styles = computedStyles[index];
      Object.entries(styles).forEach(([prop, val]) => {
        if (val) {
          el.style[prop as any] = val;
        }
      });
    });

    // Restore original getComputedStyle immediately to prevent affecting external calls or cloning processes
    window.getComputedStyle = originalGetComputedStyle;

    // 3. Create a hidden isolated iframe to render the node in a clean environment without oklch stylesheets
    iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "1000px";
    iframe.style.height = "2000px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Could not access iframe document");
    }

    // Setup basic document structure inside the iframe
    iframeDoc.open();
    iframeDoc.write("<!DOCTYPE html><html><head><style>body { margin: 0; background: #ffffff; }</style></head><body></body></html>");
    iframeDoc.close();

    // Clone the inlined node and place it in the iframe's body
    const clonedNode = node.cloneNode(true) as HTMLElement;
    iframeDoc.body.appendChild(clonedNode);

    // Call html2canvas inside the iframe's clean context!
    const canvasEl = await html2canvas(clonedNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const img = canvasEl.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvasEl.height / canvasEl.width;
    let w = pageW;
    let h = w * ratio;
    if (h > pageH) {
      h = pageH;
      w = h / ratio;
    }
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    pdf.addImage(img, "JPEG", x, y, w, h);
    return pdf.output("blob");
  } finally {
    // Ensure cleanup of the monkeypatch and temporary elements
    window.getComputedStyle = originalGetComputedStyle;
    if (iframe) {
      iframe.remove();
    }
  }
}

export async function zipAndDownload(
  files: { name: string; blob: Blob }[],
  zipName: string
) {
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.blob));
  const out = await zip.generateAsync({ type: "blob" });
  saveAs(out, zipName);
}

export function safeFileName(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 60) || "file";
}
