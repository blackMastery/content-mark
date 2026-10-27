-- Content Mark CMS: explicit grants, RLS, atomic publishing, and site media.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.site_content (
  id text primary key check (id = 'main'),
  document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) <= 200000),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
create table public.site_drafts (
  id text primary key check (id = 'main'),
  document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) <= 200000),
  revision bigint not null default 1,
  published_revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index site_drafts_updated_by_idx on public.site_drafts(updated_by);
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check(length(name) between 2 and 100),
  business text not null check(length(business) between 2 and 150),
  email text not null check(length(email) <= 254),
  phone text not null check(length(phone) between 7 and 30),
  service text not null check(length(service) between 1 and 180),
  budget text not null check(length(budget) <= 100),
  description text not null check(length(description) between 20 and 4000),
  search_text tsvector generated always as (to_tsvector('simple',name||' '||business||' '||email||' '||description)) stored,
  status text not null default 'new' check(status in ('new','contacted','qualified','closed','archived')),
  notes text not null default '' check(length(notes) <= 10000),
  notification_status text not null default 'not_configured' check(notification_status in ('not_configured','sent','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_created_at_idx on public.inquiries(created_at desc);
create index inquiries_search_text_idx on public.inquiries using gin(search_text);
create index inquiries_status_created_at_idx on public.inquiries(status,created_at desc);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.site_drafts enable row level security;
alter table public.inquiries enable row level security;
revoke all on public.admin_users, public.site_content, public.site_drafts, public.inquiries from public, anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;
grant select,update on public.site_drafts to authenticated;
grant select,update on public.inquiries to authenticated;
grant all on public.admin_users, public.site_content, public.site_drafts, public.inquiries to service_role;

create policy "Read own admin membership" on public.admin_users for select to authenticated using (user_id=(select auth.uid()));
create policy "Read published site" on public.site_content for select to anon, authenticated using(id='main');
create policy "Admins publish site" on public.site_content for update to authenticated
  using((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))))
  with check((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins read drafts" on public.site_drafts for select to authenticated
  using((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins update drafts" on public.site_drafts for update to authenticated
  using((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))))
  with check((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins read inquiries" on public.inquiries for select to authenticated
  using((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins update inquiries" on public.inquiries for update to authenticated
  using((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))))
  with check((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));

create function public.save_site_document(p_document jsonb,p_expected_revision bigint,p_publish boolean default false)
returns bigint language plpgsql security invoker set search_path='' as $$
declare current_revision bigint; new_revision bigint;
begin
  if not exists(select 1 from public.admin_users where user_id=(select auth.uid())) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  select revision into current_revision from public.site_drafts where id='main' for update;
  if current_revision is null then raise exception 'Site draft is not initialized'; end if;
  if current_revision <> p_expected_revision then raise exception 'Another session saved changes. Reload before saving.' using errcode='40001'; end if;
  new_revision := current_revision + 1;
  update public.site_drafts set document=p_document,revision=new_revision,updated_at=now(),updated_by=(select auth.uid()),
    published_revision=case when p_publish then new_revision else published_revision end where id='main';
  if p_publish then
    update public.site_content set document=p_document,revision=revision+1,updated_at=now() where id='main';
    if not found then raise exception 'Published site is not initialized'; end if;
  end if;
  return new_revision;
end; $$;
revoke all on function public.save_site_document(jsonb,bigint,boolean) from public,anon;
grant execute on function public.save_site_document(jsonb,bigint,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-media','site-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Admins upload site media" on storage.objects for insert to authenticated
  with check(bucket_id='site-media' and (select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins read media metadata" on storage.objects for select to authenticated
  using(bucket_id='site-media' and (select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
