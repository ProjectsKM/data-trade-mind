import { supabase } from "@/integrations/supabase/client";
import { getBanca, setBanca } from "@/lib/assets";

export async function hydrateBancaFromCloud(): Promise<number | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return getBanca();

  const cloudRaw = (data.user.user_metadata as Record<string, unknown> | null)?.banca;
  const cloud = typeof cloudRaw === "number" && isFinite(cloudRaw) && cloudRaw > 0 ? cloudRaw : null;

  if (cloud !== null) {
    setBanca(cloud);
    return cloud;
  }

  const local = getBanca();
  if (local !== null) {
    await supabase.auth.updateUser({ data: { banca: local } });
  }
  return local;
}

export async function setBancaSynced(value: number): Promise<void> {
  setBanca(value);
  await supabase.auth.updateUser({ data: { banca: value } });
}
