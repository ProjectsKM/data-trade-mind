import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
// Landing estática nova (HTML/CSS/JS feitos à mão) — renderizada fielmente:
// o CSS vai num <style>, o markup via dangerouslySetInnerHTML e o JS roda
// client-side após o HTML estar no DOM. Assim o design é exatamente o que
// foi entregue na pasta "landing page nova", sem reescrita/port.
import landingCss from "@/landing-nova/styles.css?raw";
import landingBody from "@/landing-nova/body.html?raw";
import landingJs from "@/landing-nova/app.js?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrionHub — Trading Inteligente com IA" },
      {
        name: "description",
        content:
          "OrionHub analisa gráficos de qualquer broker com IA em menos de 2 segundos. Mentor IA 24/7, planilha automática e calendário econômico. A plataforma do trader Gabriel Dutra — Orion Capital.",
      },
      { name: "theme-color", content: "#08060F" },
      { property: "og:title", content: "OrionHub — Trading Inteligente com IA" },
      {
        property: "og:description",
        content:
          "Análise de gráficos por IA em 2s, planilha automática, mentor IA 24/7 e radar cripto. A plataforma do trader Gabriel Dutra.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://orionmindhub.projetoskm0.workers.dev/" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  // Injeta o app.js da landing (interações: marquee, explorer, reveal,
  // contadores, nav, FAQ) depois que o markup já está no DOM.
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.text = landingJs;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingCss }} />
      <div dangerouslySetInnerHTML={{ __html: landingBody }} />
    </>
  );
}
