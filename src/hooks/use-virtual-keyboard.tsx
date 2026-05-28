import { useEffect, useState } from "react";

// Detecta a altura do teclado virtual via VisualViewport API.
// Funciona em iOS Safari onde `interactive-widget=resizes-content` é ignorado
// pelo browser. Retorna 0 quando o teclado está fechado.
export function useVirtualKeyboard(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const diff = window.innerHeight - vv.height - vv.offsetTop;
      // Threshold de 80px pra ignorar variações pequenas (barra de URL, etc.)
      setKeyboardHeight(diff > 80 ? Math.round(diff) : 0);
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return keyboardHeight;
}
