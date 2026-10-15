-- Nexo Studio analytics. No passwords, tokens, or private keys belong in this file.
-- Isolated from the PH Motions tables and functions in the same project.
create schema if not exists nexo_private;
revoke all on schema nexo_private from public;
grant usage on schema nexo_private to anon, authenticated;

create table if not exists nexo_private.admins (
  username text primary key,
  password_hash text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists nexo_private.sessions (
  token_hash text primary key,
  username text not null references nexo_private.admins(username),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists nexo_sessions_username_idx on nexo_private.sessions(username);
create table if not exists nexo_private.login_limits (
  bucket text primary key,
  attempts integer not null default 0,
  expires_at timestamptz not null
);
create table if not exists nexo_private.settings (
  key text primary key,
  value text not null
);
insert into nexo_private.settings(key,value) values
  ('collection_started_at',now()::text),
  ('login_salt',encode(extensions.gen_random_bytes(32),'hex'))
on conflict do nothing;

create table if not exists nexo_private.excluded_visitors (
  visitor_id uuid primary key,
  created_at timestamptz not null default now()
);
create table if not exists nexo_private.events (
  event_id uuid primary key,
  received_at timestamptz not null default clock_timestamp(),
  visitor_id uuid not null,
  session_id uuid not null,
  view_id uuid not null,
  context_id uuid,
  event_name text not null check(event_name in (
    'page_view','engagement','scroll','section_view','portfolio_open','project_open',
    'link_click','whatsapp_click','video_play','video_progress','video_watch',
    'video_complete','video_error','brief_open','brief_submit','service_open','faq_open'
  )),
  page_path text not null check(page_path in ('/','/index.html')),
  source text not null default 'direto',
  referrer_host text,
  utm_medium text,
  utm_campaign text,
  device text not null check(device in ('mobile','tablet','desktop')),
  browser text,
  os text,
  section text,
  action text,
  project text,
  category text,
  target_host text,
  active_seconds integer not null default 0 check(active_seconds between 0 and 21600),
  scroll_depth integer not null default 0 check(scroll_depth between 0 and 100),
  progress integer not null default 0 check(progress between 0 and 100),
  watch_seconds integer not null default 0 check(watch_seconds between 0 and 21600)
);
create index if not exists nexo_events_time_idx on nexo_private.events(received_at desc);
create index if not exists nexo_events_visitor_idx on nexo_private.events(visitor_id,received_at);
create index if not exists nexo_events_session_idx on nexo_private.events(session_id,received_at);
create index if not exists nexo_events_view_idx on nexo_private.events(view_id);
alter table nexo_private.admins enable row level security;
alter table nexo_private.sessions enable row level security;
alter table nexo_private.login_limits enable row level security;
alter table nexo_private.settings enable row level security;
alter table nexo_private.excluded_visitors enable row level security;
alter table nexo_private.events enable row level security;
revoke all on all tables in schema nexo_private from public,anon,authenticated;

create or replace function nexo_private.require_session(p_token text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_username text;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then
    raise exception 'Sessão inválida. Entre novamente.' using errcode='42501';
  end if;
  select s.username into v_username from nexo_private.sessions s
    join nexo_private.admins a on a.username=s.username and a.enabled
    where s.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
      and s.expires_at>now();
  if v_username is null then raise exception 'Sessão expirada. Entre novamente.' using errcode='42501'; end if;
  return v_username;
end; $$;

create or replace function nexo_private.login(p_username text,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_admin nexo_private.admins%rowtype;
  v_headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
  v_bucket text; v_attempts integer; v_token text;
begin
  if length(coalesce(p_username,''))>80 or length(coalesce(p_password,''))>200 then return jsonb_build_object('ok',false); end if;
  v_bucket:=encode(extensions.digest(
    coalesce(v_headers->>'x-forwarded-for','unknown')||'|'||lower(trim(coalesce(p_username,'')))||'|'||
    (select value from nexo_private.settings where key='login_salt'),'sha256'),'hex');
  insert into nexo_private.login_limits(bucket,attempts,expires_at) values(v_bucket,1,now()+interval '15 minutes')
    on conflict(bucket) do update set attempts=case when nexo_private.login_limits.expires_at<now() then 1 else nexo_private.login_limits.attempts+1 end,
      expires_at=case when nexo_private.login_limits.expires_at<now() then now()+interval '15 minutes' else nexo_private.login_limits.expires_at end
    returning attempts into v_attempts;
  if v_attempts>8 then return jsonb_build_object('ok',false,'locked',true); end if;
  select * into v_admin from nexo_private.admins where username=lower(trim(coalesce(p_username,''))) and enabled;
  if v_admin.username is null or extensions.crypt(coalesce(p_password,''),v_admin.password_hash) is distinct from v_admin.password_hash then
    return jsonb_build_object('ok',false);
  end if;
  v_token:=encode(extensions.gen_random_bytes(32),'hex');
  delete from nexo_private.sessions where expires_at<now();
  delete from nexo_private.login_limits where expires_at<now() or bucket=v_bucket;
  insert into nexo_private.sessions(token_hash,username,expires_at)
    values(encode(extensions.digest(v_token,'sha256'),'hex'),v_admin.username,now()+interval '1 hour');
  return jsonb_build_object('ok',true,'token',v_token,'username',v_admin.username,'expires_in',3600);
end; $$;

create or replace function nexo_private.logout(p_token text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from nexo_private.sessions where token_hash=encode(extensions.digest(coalesce(p_token,''),'sha256'),'hex');
  return true;
end; $$;

create or replace function nexo_private.exclude_visitor(p_token text,p_visitor_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform nexo_private.require_session(p_token);
  insert into nexo_private.excluded_visitors(visitor_id) values(p_visitor_id) on conflict do nothing;
  return true;
end; $$;

create or replace function nexo_private.collect(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
  v_origin text; v_item jsonb; v_visitor uuid; v_session uuid; v_view uuid;
  v_accepted integer:=0; v_rejected integer:=0; v_count integer;
begin
  v_origin:=v_headers->>'origin';
  if v_origin not in ('https://nexostud.com.br','https://www.nexostud.com.br') or v_origin is null then
    raise exception 'Origin not allowed' using errcode='42501';
  end if;
  if p_payload is null or octet_length(p_payload::text)>40000 or jsonb_typeof(p_payload->'events') is distinct from 'array'
     or jsonb_array_length(p_payload->'events') not between 1 and 24 then
    raise exception 'Invalid payload' using errcode='22023';
  end if;
  v_visitor:=(p_payload->>'visitor_id')::uuid;
  v_session:=(p_payload->>'session_id')::uuid;
  v_view:=(p_payload->>'view_id')::uuid;
  if v_visitor is null or v_session is null or v_view is null then raise exception 'Missing identifiers' using errcode='22023'; end if;
  if exists(select 1 from nexo_private.excluded_visitors where visitor_id=v_visitor) then
    return jsonb_build_object('accepted',0,'excluded',true);
  end if;
  if p_payload->>'page_path' not in ('/','/index.html') or p_payload->>'device' not in ('mobile','tablet','desktop') then
    raise exception 'Invalid page or device' using errcode='22023';
  end if;
  select count(*) into v_count from nexo_private.events where visitor_id=v_visitor and received_at>now()-interval '1 minute';
  if v_count>=120 then return jsonb_build_object('accepted',0,'limited',true); end if;
  for v_item in select * from jsonb_array_elements(p_payload->'events') loop
    begin
      insert into nexo_private.events(event_id,visitor_id,session_id,view_id,context_id,event_name,page_path,
        source,referrer_host,utm_medium,utm_campaign,device,browser,os,section,action,project,category,target_host,
        active_seconds,scroll_depth,progress,watch_seconds)
      values((v_item->>'id')::uuid,v_visitor,v_session,v_view,nullif(v_item->>'context_id','')::uuid,v_item->>'name',p_payload->>'page_path',
        left(coalesce(nullif(p_payload->>'source',''),'direto'),80),left(p_payload->>'referrer_host',160),
        left(p_payload->>'utm_medium',80),left(p_payload->>'utm_campaign',100),p_payload->>'device',
        left(p_payload->>'browser',40),left(p_payload->>'os',40),left(v_item->>'section',80),
        left(v_item->>'action',100),left(v_item->>'project',80),left(v_item->>'category',30),left(v_item->>'target_host',160),
        least(21600,greatest(0,coalesce((v_item->>'active_seconds')::integer,0))),
        least(100,greatest(0,coalesce((v_item->>'scroll_depth')::integer,0))),
        least(100,greatest(0,coalesce((v_item->>'progress')::integer,0))),
        least(21600,greatest(0,coalesce((v_item->>'watch_seconds')::integer,0))))
      on conflict(event_id) do nothing;
      get diagnostics v_count = row_count;
      v_accepted:=v_accepted+v_count;
    exception when invalid_text_representation or check_violation or not_null_violation then
      v_rejected:=v_rejected+1;
    end;
  end loop;
  return jsonb_build_object('accepted',v_accepted,'rejected',v_rejected);
end; $$;

create or replace function nexo_private.report(p_token text,p_start date,p_end date,p_device text default '',p_source text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_start date:=coalesce(p_start,(now() at time zone 'America/Sao_Paulo')::date-6);
  v_end date:=coalesce(p_end,(now() at time zone 'America/Sao_Paulo')::date);
  v_started timestamptz; v_result jsonb; v_username text;
begin
  v_username:=nexo_private.require_session(p_token);
  if v_end<v_start or v_end-v_start>366 then raise exception 'Escolha um período de até 367 dias.' using errcode='22023'; end if;
  select value::timestamptz into v_started from nexo_private.settings where key='collection_started_at';
  with all_events as materialized (
    select e.* from nexo_private.events e
    where not exists(select 1 from nexo_private.excluded_visitors x where x.visitor_id=e.visitor_id)
  ), filtered as materialized (
    select * from all_events where received_at>=v_start::timestamp at time zone 'America/Sao_Paulo'
      and received_at<(v_end+1)::timestamp at time zone 'America/Sao_Paulo'
      and (coalesce(p_device,'')='' or device=p_device) and (coalesce(p_source,'')='' or source=p_source)
  ), views as (
    select session_id,view_id,max(active_seconds) as active_seconds,max(scroll_depth) as depth from filtered group by 1,2
  ), sessions as materialized (
    select f.session_id,min(f.visitor_id::text) as visitor_id,min(f.received_at) as first_at,max(f.received_at) as last_at,
      (array_agg(f.source order by f.received_at))[1] as source,(array_agg(f.device order by f.received_at))[1] as device,
      (array_agg(f.browser order by f.received_at))[1] as browser,(array_agg(f.os order by f.received_at))[1] as os,
      coalesce((select sum(v.active_seconds) from views v where v.session_id=f.session_id),0) as active_seconds,
      max(f.scroll_depth) as depth,count(*) filter(where event_name='page_view') as page_views,
      bool_or(event_name='whatsapp_click') as contacted,bool_or(event_name='portfolio_open') as portfolio,
      count(*) filter(where event_name='whatsapp_click') as contact_clicks,
      min(f.received_at) filter(where event_name='portfolio_open') as portfolio_at,
      max(f.received_at) filter(where event_name='whatsapp_click') as contact_at,
      bool_or(event_name in ('whatsapp_click','portfolio_open','project_open')) as meaningful
    from filtered f group by f.session_id
  ), first_visitors as (
    select visitor_id::text as visitor_id,min(received_at) as first_at from all_events group by 1
  ), video_instances as (
    select project,coalesce(context_id,view_id) as context_id,
      bool_or(event_name='video_play') as played,bool_or(event_name='video_complete') as completed,
      max(progress) as progress,max(watch_seconds) as watch_seconds,
      bool_or(event_name='video_error') as had_error
    from filtered where event_name like 'video_%' and project is not null group by 1,2
  ), daily as (
    select d::date as day,
      count(distinct f.visitor_id) as visitors,count(distinct f.session_id) as sessions,
      count(*) filter(where f.event_name='page_view') as views,
      count(distinct f.session_id) filter(where f.event_name='whatsapp_click') as contacts
    from generate_series(greatest(v_start,(v_started at time zone 'America/Sao_Paulo')::date)::timestamp,
      least(v_end,(now() at time zone 'America/Sao_Paulo')::date)::timestamp,interval '1 day') d
    left join filtered f on (f.received_at at time zone 'America/Sao_Paulo')::date=d::date group by d
  )
  select jsonb_build_object(
    'username',v_username,'generated_at',now(),'collection_started_at',v_started,'timezone','America/Sao_Paulo',
    'range',jsonb_build_object('start',v_start,'end',v_end,'device',p_device,'source',p_source),
    'overview',(select jsonb_build_object(
      'visitors',count(distinct s.visitor_id),'sessions',count(*),'page_views',coalesce(sum(s.page_views),0),
      'avg_active_seconds',coalesce(round(avg(s.active_seconds)),0),
      'engaged_sessions',count(*) filter(where s.active_seconds>=10 or s.meaningful),
      'engagement_rate',coalesce(round(100.0*count(*) filter(where s.active_seconds>=10 or s.meaningful)/nullif(count(*),0),1),0),
      'whatsapp_sessions',count(*) filter(where s.contacted),'whatsapp_clicks',coalesce(sum(s.contact_clicks),0),
      'contact_rate',coalesce(round(100.0*count(*) filter(where s.contacted)/nullif(count(*),0),1),0),
      'portfolio_sessions',count(*) filter(where s.portfolio),
      'new_visitors',count(distinct s.visitor_id) filter(where fv.first_at>=v_start::timestamp at time zone 'America/Sao_Paulo'),
      'returning_visitors',count(distinct s.visitor_id) filter(where fv.first_at<v_start::timestamp at time zone 'America/Sao_Paulo'),
      'online',count(*) filter(where s.last_at>=now()-interval '5 minutes'),
      'scroll_75_sessions',count(*) filter(where s.depth>=75)
    ) from sessions s join first_visitors fv using(visitor_id)),
    'events',(select jsonb_build_object(
      'clicks',count(*) filter(where event_name in ('link_click','whatsapp_click')),
      'portfolio_opens',count(*) filter(where event_name='portfolio_open'),
      'projects_opened',count(*) filter(where event_name='project_open'),
      'brief_submits',count(*) filter(where event_name='brief_submit'),
      'video_plays',count(*) filter(where event_name='video_play'),
      'video_errors',count(*) filter(where event_name='video_error')) from filtered),
    'daily',coalesce((select jsonb_agg(to_jsonb(d) order by day) from daily d),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(to_jsonb(t)) from (
      select source,count(*) as sessions,count(distinct visitor_id) as visitors,count(*) filter(where contacted) as contacts,
      round(avg(active_seconds)) as avg_active_seconds from sessions group by source order by sessions desc limit 20
    ) t),'[]'::jsonb),
    'devices',coalesce((select jsonb_agg(to_jsonb(t)) from (select device,count(*) as sessions,count(*) filter(where contacted) as contacts from sessions group by device order by sessions desc) t),'[]'::jsonb),
    'browsers',coalesce((select jsonb_agg(to_jsonb(t)) from (select coalesce(browser,'Outros') as browser,count(*) as sessions from sessions group by browser order by sessions desc limit 10) t),'[]'::jsonb),
    'systems',coalesce((select jsonb_agg(to_jsonb(t)) from (select coalesce(os,'Outros') as os,count(*) as sessions from sessions group by os order by sessions desc limit 10) t),'[]'::jsonb),
    'journey',(select jsonb_build_object('visits',count(*),'portfolio',count(*) filter(where portfolio),
      'portfolio_contact',count(*) filter(where portfolio and contact_at>=portfolio_at),
      'direct_contact',count(*) filter(where contacted and not portfolio)) from sessions),
    'portfolios',coalesce((select jsonb_agg(to_jsonb(t)) from (select category,count(*) as opens,count(distinct session_id) as sessions
      from filtered where event_name='portfolio_open' group by category order by opens desc) t),'[]'::jsonb),
    'projects',coalesce((select jsonb_agg(to_jsonb(t)) from (select project,category,count(*) as opens,count(distinct session_id) as sessions
      from filtered where event_name='project_open' group by project,category order by opens desc) t),'[]'::jsonb),
    'videos',coalesce((select jsonb_agg(to_jsonb(t)) from (select project,count(*) filter(where played) as plays,
      count(*) filter(where played and progress>=25) as reached_25,count(*) filter(where played and progress>=50) as reached_50,
      count(*) filter(where played and progress>=75) as reached_75,count(*) filter(where played and completed) as completed,
      coalesce(round(avg(watch_seconds) filter(where played)),0) as avg_watch_seconds,count(*) filter(where had_error) as errors
      from video_instances group by project order by plays desc) t),'[]'::jsonb),
    'sections',coalesce((select jsonb_agg(to_jsonb(t)) from (select section,count(distinct session_id) as sessions
      from filtered where event_name='section_view' group by section order by sessions desc) t),'[]'::jsonb),
    'whatsapp_buttons',coalesce((select jsonb_agg(to_jsonb(t)) from (select section,action,count(*) as clicks,count(distinct session_id) as sessions
      from filtered where event_name='whatsapp_click' group by section,action order by clicks desc) t),'[]'::jsonb),
    'links',coalesce((select jsonb_agg(to_jsonb(t)) from (select section,action,target_host,count(*) as clicks
      from filtered where event_name='link_click' group by section,action,target_host order by clicks desc limit 30) t),'[]'::jsonb),
    'campaigns',coalesce((select jsonb_agg(to_jsonb(t)) from (select source,utm_medium,utm_campaign,count(distinct session_id) as sessions,
      count(distinct session_id) filter(where event_name='whatsapp_click') as contacts
      from filtered where utm_campaign is not null and utm_campaign<>'' group by source,utm_medium,utm_campaign order by sessions desc limit 20) t),'[]'::jsonb),
    'hours',coalesce((select jsonb_agg(to_jsonb(t)) from (select extract(hour from first_at at time zone 'America/Sao_Paulo')::integer as hour,count(*) as sessions
      from sessions group by 1 order by 1) t),'[]'::jsonb),
    'recent',coalesce((select jsonb_agg(to_jsonb(t)) from (select received_at,event_name,section,action,project,category,device,source
      from filtered where event_name not in ('engagement','video_watch') order by received_at desc limit 25) t),'[]'::jsonb),
    'source_options',coalesce((select jsonb_agg(distinct source) from all_events),'[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

-- Public wrappers have no elevated privileges. Only the private implementations
-- may touch the tables, and every report/exclusion verifies its own server token.
create or replace function public.nexo_login(p_username text,p_password text) returns jsonb
language sql security invoker set search_path='' as $$ select nexo_private.login(p_username,p_password); $$;
create or replace function public.nexo_logout(p_token text) returns boolean
language sql security invoker set search_path='' as $$ select nexo_private.logout(p_token); $$;
create or replace function public.nexo_exclude_visitor(p_token text,p_visitor_id uuid) returns boolean
language sql security invoker set search_path='' as $$ select nexo_private.exclude_visitor(p_token,p_visitor_id); $$;
create or replace function public.nexo_collect(p_payload jsonb) returns jsonb
language sql security invoker set search_path='' as $$ select nexo_private.collect(p_payload); $$;
create or replace function public.nexo_report(p_token text,p_start date,p_end date,p_device text default '',p_source text default '') returns jsonb
language sql security invoker set search_path='' as $$ select nexo_private.report(p_token,p_start,p_end,p_device,p_source); $$;
revoke all on all functions in schema nexo_private from public,anon,authenticated;
grant execute on function nexo_private.login(text,text),nexo_private.logout(text),nexo_private.exclude_visitor(text,uuid),nexo_private.collect(jsonb),nexo_private.report(text,date,date,text,text) to anon,authenticated;
revoke all on function public.nexo_login(text,text),public.nexo_logout(text),public.nexo_exclude_visitor(text,uuid),public.nexo_collect(jsonb),public.nexo_report(text,date,date,text,text) from public;
grant execute on function public.nexo_login(text,text),public.nexo_logout(text),public.nexo_exclude_visitor(text,uuid),public.nexo_collect(jsonb),public.nexo_report(text,date,date,text,text) to anon,authenticated;
notify pgrst,'reload schema';
