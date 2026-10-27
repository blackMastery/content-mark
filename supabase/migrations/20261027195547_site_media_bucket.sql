-- Media bucket configuration is data rather than schema, so keep it explicit.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-media','site-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

-- New tables must receive deliberate grants; RLS cannot protect TRUNCATE.
alter default privileges for role postgres in schema public revoke all on tables from anon,authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon,authenticated;

-- Keep grants explicit for server roles and future functions as well.
alter default privileges for role postgres in schema public revoke all on tables from service_role;
alter default privileges for role postgres in schema public revoke all on sequences from service_role;
alter default privileges for role postgres in schema public revoke all on functions from anon,authenticated,service_role;
revoke all on function public.save_site_document(jsonb,bigint,boolean) from service_role;
