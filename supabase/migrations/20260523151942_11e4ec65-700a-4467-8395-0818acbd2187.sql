create or replace function public.require_premium()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _pro boolean;
begin
  select is_pro into _pro from public.user_plans where user_id = NEW.user_id;
  if not coalesce(_pro, false) then
    raise exception 'PREMIUM_REQUIRED' using errcode = '42501';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trades_premium_required on public.trades;
create trigger trades_premium_required
  before insert on public.trades
  for each row execute function public.require_premium();

drop trigger if exists mind_messages_premium_required on public.mind_messages;
create trigger mind_messages_premium_required
  before insert on public.mind_messages
  for each row execute function public.require_premium();

drop trigger if exists scan_history_premium_required on public.scan_history;
create trigger scan_history_premium_required
  before insert on public.scan_history
  for each row execute function public.require_premium();