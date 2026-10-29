-- Non-destructive integration test. Uses an approved admin's ID only inside
-- transaction-local claims, and rolls back every test row on success or error.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.admin_users limit 1),true);
set local role authenticated;
do $$
declare
  test_id uuid := '1a077317-92c5-45ae-8e6d-d12e6f751477';
  doc jsonb := '{"title":"Blog workflow test","slug":"blog-workflow-test-1a077317","excerpt":"Test article","cover":"","coverAlt":"","blocks":[{"id":"one","type":"text","text":"First published version"}]}';
  rev bigint;
begin
  assert (select auth.uid()) is not null, 'An approved admin is required';
  rev := public.save_blog_post(test_id,doc,0,false);
  assert rev = 1;
  assert not exists(select 1 from public.blog_publications where id=test_id), 'Draft must stay private';
  rev := public.save_blog_post(test_id,doc,1,true);
  assert rev = 2;
  assert (select document->>'title' from public.blog_publications where id=test_id) = 'Blog workflow test';
  rev := public.save_blog_post(test_id,jsonb_set(doc,'{title}','"Unpublished edits"'),2,false);
  assert rev = 3;
  assert (select document->>'title' from public.blog_publications where id=test_id) = 'Blog workflow test', 'Draft edit must not alter publication';
  begin
    perform public.save_blog_post(test_id,doc,2,true);
    raise exception 'Stale revision was accepted';
  exception when serialization_failure then null;
  end;
end; $$;
set local role anon;
do $$
begin
  assert exists(select 1 from public.blog_publications where slug='blog-workflow-test-1a077317'), 'Anon must read publication';
  begin
    perform 1 from public.blog_posts;
    raise exception 'Anon can read drafts';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_blog_post(gen_random_uuid(),'{}',0,true);
    raise exception 'Anon can publish';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;
select set_config('request.jwt.claim.sub','7e754c9d-0b4b-4c8b-a9f7-194d01d276d0',true);
set local role authenticated;
do $$
begin
  assert not exists(select 1 from public.blog_posts), 'Signed-in non-admin must not read drafts';
  begin
    perform public.save_blog_post(gen_random_uuid(),'{}',0,false);
    raise exception 'Non-admin can save';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects(bucket_id,name) values('blog-media','unapproved/test.png');
    raise exception 'Non-admin can upload';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.admin_users limit 1),true);
set local role authenticated;
do $$
declare rev bigint;
begin
  rev := public.unpublish_blog_post('1a077317-92c5-45ae-8e6d-d12e6f751477',3);
  assert rev=4;
  assert not exists(select 1 from public.blog_publications where id='1a077317-92c5-45ae-8e6d-d12e6f751477');
  assert exists(select 1 from public.blog_posts where id='1a077317-92c5-45ae-8e6d-d12e6f751477'), 'Unpublish keeps draft';
end; $$;
rollback;
select 'PASS: draft, publication, private edits, stale writes, anon / non-admin RLS, unpublish' as blog_workflow;
