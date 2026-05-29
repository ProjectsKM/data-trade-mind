import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type Phase = "idle" | "recording" | "paused" | "transcribing";

export function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(24).fill(0));

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const elapsedBaseRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const discardRef = useRef(false);

  function cleanup() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      void audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    mediaRef.current = null;
    chunksRef.current = [];
  }

  useEffect(() => () => cleanup(), []);

  function startTick() {
    if (tickRef.current) return;
    tickRef.current = window.setInterval(() => {
      setElapsed(elapsedBaseRef.current + (Date.now() - startedAtRef.current));
    }, 200);
  }
  function stopTick() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    elapsedBaseRef.current = elapsedBaseRef.current + (Date.now() - startedAtRef.current);
    setElapsed(elapsedBaseRef.current);
  }

  function startSpectrum() {
    const tick = () => {
      const an = analyserRef.current;
      if (!an) return;
      const buf = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(buf);
      const bars = 24;
      const step = Math.floor(buf.length / bars);
      const out: number[] = [];
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += buf[i * step + j];
        out.push(Math.min(1, sum / (step * 180)));
      }
      setLevels(out);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function start() {
    if (disabled) return;
    // getUserMedia só funciona em contexto seguro (HTTPS ou localhost).
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Seu navegador não suporta gravação de áudio (ou o site não está em HTTPS).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      // Chrome/iOS criam o AudioContext "suspended" até um gesto — sem resume
      // o analyser não recebe dados e a waveform fica parada (parece que o mic
      // não foi detectado, mesmo gravando normalmente).
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => undefined);
      }
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      discardRef.current = false;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        void onStop();
      };
      mr.start(250);

      elapsedBaseRef.current = 0;
      startedAtRef.current = Date.now();
      setElapsed(0);
      setPhase("recording");
      startTick();
      startSpectrum();
    } catch (err) {
      console.error(err);
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        toast.error(
          "Permissão de microfone negada. Libere o acesso nas configurações do navegador.",
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        toast.error("Nenhum microfone encontrado neste dispositivo.");
      } else if (name === "NotReadableError") {
        toast.error("O microfone está em uso por outro app. Feche e tente de novo.");
      } else {
        toast.error("Não foi possível acessar o microfone.");
      }
      cleanup();
      setPhase("idle");
    }
  }

  function pause() {
    const mr = mediaRef.current;
    if (!mr || mr.state !== "recording") return;
    mr.pause();
    stopTick();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPhase("paused");
  }

  function resume() {
    const mr = mediaRef.current;
    if (!mr || mr.state !== "paused") return;
    mr.resume();
    startedAtRef.current = Date.now();
    setPhase("recording");
    startTick();
    startSpectrum();
  }

  function discard() {
    discardRef.current = true;
    const mr = mediaRef.current;
    try {
      mr?.stop();
    } catch {
      /* ignore */
    }
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPhase("idle");
    setElapsed(0);
    elapsedBaseRef.current = 0;
  }

  function send() {
    const mr = mediaRef.current;
    if (!mr) return;
    // Evita clique duplo: só envia a partir de gravação/pausa, nunca durante transcrição.
    if (phase !== "recording" && phase !== "paused") return;
    setPhase("transcribing");
    if (mr.state !== "inactive") {
      try {
        mr.stop();
      } catch {
        /* ignore */
      }
    } else {
      void onStop();
    }
  }

  async function onStop() {
    if (discardRef.current) {
      cleanup();
      return;
    }
    const chunks = chunksRef.current.slice();
    const mime = mediaRef.current?.mimeType || "audio/webm";
    cleanup();
    if (chunks.length === 0) {
      toast.error("Áudio vazio.");
      setPhase("idle");
      return;
    }
    setPhase("transcribing");
    try {
      const blob = new Blob(chunks, { type: mime });
      // Refresh defensivo — token expirado dava 401 silencioso na transcrição.
      const getFreshToken = async (): Promise<string | null> => {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed.session?.access_token) return refreshed.session.access_token;
        const { data: sess } = await supabase.auth.getSession();
        return sess.session?.access_token ?? null;
      };
      const token = await getFreshToken();
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        setPhase("idle");
        return;
      }
      const form = new FormData();
      const ext = mime.includes("webm") ? "webm" : mime.includes("mp4") ? "mp4" : "ogg";
      form.append("audio", new File([blob], `voice.${ext}`, { type: mime }));
      const post = (tk: string) =>
        fetch("/api/transcribe", {
          method: "POST",
          headers: { Authorization: `Bearer ${tk}` },
          body: form,
        });
      let r = await post(token);
      // Retry uma vez no 401: durante a gravação (que pode durar minutos) o
      // supabase-js às vezes rotaciona o token em background, então o primeiro
      // envio leva o token antigo e o servidor responde "Não autorizado".
      if (r.status === 401) {
        const t2 = await getFreshToken();
        if (t2) r = await post(t2);
      }
      const data = (await r.json()) as { ok: boolean; text?: string; error?: string };
      if (!data.ok) {
        toast.error(data.error || "Falha ao transcrever.");
        setPhase("idle");
        return;
      }
      if (!data.text) {
        toast.error("Não consegui entender o áudio.");
        setPhase("idle");
        return;
      }
      onTranscript(data.text);
      setPhase("idle");
      setElapsed(0);
      elapsedBaseRef.current = 0;
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão na transcrição.");
      setPhase("idle");
    }
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={() => void start()}
        disabled={disabled}
        title="Gravar áudio"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-md border smooth hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:opacity-40"
        style={{
          borderColor: "var(--border-strong)",
          background: "var(--surface-2)",
          color: "var(--text-muted)",
        }}
      >
        <Mic className="h-4 w-4" strokeWidth={1.75} />
      </button>
    );
  }

  if (phase === "transcribing") {
    return (
      <div
        className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--accent)" }} />
        Transcrevendo…
      </div>
    );
  }

  const seconds = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isPaused = phase === "paused";

  return (
    <div
      className="flex h-9 flex-1 items-center gap-2 rounded-md border px-2"
      style={{
        borderColor: "color-mix(in oklab, var(--red) 35%, var(--border-strong))",
        background: "var(--surface-2)",
      }}
    >
      <span
        className={`flex h-2 w-2 flex-none rounded-full ${isPaused ? "" : "blink-dot"}`}
        style={{ background: isPaused ? "var(--text-dim)" : "var(--red)" }}
      />
      <span className="font-mono text-[11px] tabular text-muted-foreground">
        {mm}:{ss}
      </span>
      {/* Waveform estilo Apple: barras centralizadas verticalmente, arredondadas */}
      <div className="flex h-6 flex-1 items-center justify-center gap-[2px]">
        {levels.map((v, i) => (
          <span
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${Math.max(12, Math.min(100, v * 120))}%`,
              minHeight: 3,
              background: isPaused
                ? "color-mix(in oklab, var(--text-dim) 55%, transparent)"
                : `color-mix(in oklab, var(--accent) ${45 + v * 55}%, transparent)`,
              transition: "height 100ms cubic-bezier(.2,.7,.2,1)",
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={discard}
        title="Descartar"
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md border smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)]"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={isPaused ? resume : pause}
        title={isPaused ? "Retomar" : "Pausar"}
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md border smooth hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={send}
        title="Enviar para transcrição"
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md smooth press"
        style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
