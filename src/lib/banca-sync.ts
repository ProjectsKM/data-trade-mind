import { supabase } from "@/integrations/supabase/client";
import { getBanca, setBanca, getBancaUpdatedAt } from "@/lib/assets";

type Meta = Record<string, unknown> | null;

function readCloud(meta: Meta): { value: number | null; ts: number } {
  const rawV = meta?.banca;
  const value = typeof rawV === "number" && isFinite(rawV) && rawV > 0 ? rawV : null;
  const rawTs = meta?.bancaUpdatedAt;
  const ts = typeof rawTs === "number" && isFinite(rawTs) ? rawTs : 0;
  return { value, ts };
}

/**
 * Reconcilia a banca local com a nuvem usando timestamp (last-write-wins), em vez
 * de "nuvem sempre vence". Assim uma redução de banca feita localmente não é
 * revertida por um valor antigo guardado no metadata do usuário.
 */
export async function hydrateBancaFromCloud(): Promise<number | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return getBanca();

  const { value: cloud, ts: cloudTs } = readCloud(data.user.user_metadata as Meta);
  const local = getBanca();
  const localTs = getBancaUpdatedAt();

  // Sem valor na nuvem: empurra o local (se houver) para a nuvem.
  if (cloud === null) {
    if (local !== null) {
      await supabase.auth.updateUser({
        data: { banca: local, bancaUpdatedAt: localTs || Date.now() },
      });
    }
    return local;
  }

  // Sem valor local: adota o da nuvem.
  if (local === null) {
    setBanca(cloud, cloudTs || Date.now());
    return cloud;
  }

  // Ambos existem: vence o mais recente.
  if (localTs > cloudTs) {
    await supabase.auth.updateUser({ data: { banca: local, bancaUpdatedAt: localTs } });
    return local;
  }
  setBanca(cloud, cloudTs);
  return cloud;
}

export async function setBancaSynced(value: number): Promise<void> {
  const ts = Date.now();
  setBanca(value, ts);
  await supabase.auth.updateUser({ data: { banca: value, bancaUpdatedAt: ts } });
}
