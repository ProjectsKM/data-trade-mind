// Token de acesso do Supabase — fonte única para pegar/renovar o JWT no client.
//
// POR QUE ISTO EXISTE (bug do "deslogou sozinho a cada ~1h"):
// `supabase.auth.refreshSession()` SEMPRE rotaciona o refresh token. O app
// chamava isso de forma proativa em vários lugares (a cada mensagem do chat,
// a cada áudio, no mount de cada componente). Um refresh token só pode ser
// usado UMA vez; reutilizar um token já rotacionado fora da janela de 10s do
// Supabase TERMINA a sessão inteira — e era isso que jogava o usuário de volta
// pra tela de login (tipicamente perto da expiração do JWT, quando vários
// pontos do app corriam pra rotacionar o mesmo refresh token ao mesmo tempo).
//
// `getSession()` devolve o token em cache SEM rotacionar quando ele ainda é
// válido, e renova de forma transparente (uma vez, deduplicada) só quando
// expira. Por isso ele é o caminho padrão para obter o token.
import { supabase } from "./client";

// Renova o token quando faltam menos de 60s pra expirar (cobre clock skew e a
// latência entre pegar o token e a request chegar no servidor — comum no
// mobile/Safari ao voltar de background).
const STALE_MARGIN_MS = 60_000;

/**
 * Retorna um access token válido, renovando SOMENTE quando o token atual
 * está ausente ou perto de expirar (< 60s). Não força rotação à toa — é o
 * que deve ser usado em todo fluxo normal (chat, áudio, chamadas de API).
 */
export async function getAccessToken(): Promise<string | null> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token ?? null;
  const exp = sess.session?.expires_at; // unix em segundos
  const isStale = !token || (exp ? exp * 1000 - Date.now() < STALE_MARGIN_MS : true);
  if (!isStale) return token;
  const { data: refreshed } = await supabase.auth.refreshSession();
  return refreshed.session?.access_token ?? token;
}

/**
 * Força UMA rotação do refresh token. Use APENAS como reação a um 401 real
 * (o servidor rejeitou o access token), nunca de forma proativa.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const { data: refreshed } = await supabase.auth.refreshSession();
  if (refreshed.session?.access_token) return refreshed.session.access_token;
  const { data: sess } = await supabase.auth.getSession();
  return sess.session?.access_token ?? null;
}
