begin;
create table public.blog_posts (
  id uuid primary key,
  document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) <= 200000),
  revision bigint not null default 1,
  published_revision bigint,
  updated_at timestamptz not null default now()
);
create table public.blog_publications (
  id uuid primary key references public.blog_posts(id) on delete cascade,
  slug text not null unique check (length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) <= 200000),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_publications_date_idx on public.blog_publications(published_at desc);
create index blog_posts_updated_idx on public.blog_posts(updated_at desc);
alter table public.blog_posts enable row level security;
alter table public.blog_publications enable row level security;
revoke all on public.blog_posts, public.blog_publications from public, anon, authenticated;
grant select, insert, update, delete on public.blog_posts, public.blog_publications to authenticated;
grant select on public.blog_publications to anon;
grant all on public.blog_posts, public.blog_publications to service_role;
create policy "Admins manage blog drafts" on public.blog_posts for all to authenticated
  using ((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))))
  with check ((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Anyone reads published articles" on public.blog_publications for select to anon, authenticated using (true);
create policy "Admins manage blog publications" on public.blog_publications for all to authenticated
  using ((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))))
  with check ((select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));

create function public.save_blog_post(p_id uuid, p_document jsonb, p_expected_revision bigint, p_publish boolean default false)
returns bigint language plpgsql security invoker set search_path='' as $$
declare current_revision bigint; new_revision bigint;
begin
  if not exists(select 1 from public.admin_users where user_id=(select auth.uid())) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  if p_expected_revision = 0 then
    insert into public.blog_posts(id,document,revision) values(p_id,p_document,1) on conflict(id) do nothing;
    if not found then raise exception 'Another session saved changes' using errcode='40001'; end if;
    current_revision := 1;
    new_revision := 1;
  else
    select revision into current_revision from public.blog_posts where id=p_id for update;
    if current_revision is null or current_revision <> p_expected_revision then
      raise exception 'Another session saved changes' using errcode='40001';
    end if;
    new_revision := current_revision + 1;
  end if;
  update public.blog_posts set document=p_document,revision=new_revision,updated_at=now(),
    published_revision=case when p_publish then new_revision else published_revision end where id=p_id;
  if p_publish then
    if coalesce(trim(p_document->>'title'),'') = '' or coalesce(p_document->>'slug','') = '' or jsonb_array_length(p_document->'blocks') = 0 then
      raise exception 'Complete the article before publishing' using errcode='22023';
    end if;
    insert into public.blog_publications(id,slug,document) values(p_id,p_document->>'slug',p_document)
    on conflict(id) do update set slug=excluded.slug,document=excluded.document,updated_at=now();
  end if;
  return new_revision;
end; $$;
create function public.unpublish_blog_post(p_id uuid, p_expected_revision bigint)
returns bigint language plpgsql security invoker set search_path='' as $$
declare current_revision bigint;
begin
  if not exists(select 1 from public.admin_users where user_id=(select auth.uid())) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  select revision into current_revision from public.blog_posts where id=p_id for update;
  if current_revision is null or current_revision <> p_expected_revision then
    raise exception 'Another session saved changes' using errcode='40001';
  end if;
  delete from public.blog_publications where id=p_id;
  update public.blog_posts set revision=revision+1,published_revision=null,updated_at=now() where id=p_id;
  return current_revision+1;
end; $$;
revoke all on function public.save_blog_post(uuid,jsonb,bigint,boolean),public.unpublish_blog_post(uuid,bigint) from public, anon, service_role;
grant execute on function public.save_blog_post(uuid,jsonb,bigint,boolean),public.unpublish_blog_post(uuid,bigint) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('blog-media','blog-media',false,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']);
create policy "Admins upload blog media" on storage.objects for insert to authenticated
  with check(bucket_id='blog-media' and (select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
create policy "Admins read blog media" on storage.objects for select to authenticated
  using(bucket_id='blog-media' and (select exists(select 1 from public.admin_users where user_id=(select auth.uid()))));
notify pgrst, 'reload schema';
commit;
