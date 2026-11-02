begin;
-- One transaction for the horse, listing, and both parent links. RLS remains active.
create function public.save_horse(payload jsonb) returns uuid language plpgsql security invoker set search_path = '' as $$
declare hid uuid; parent uuid; link_role text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 hid := nullif(payload->>'id','')::uuid;
 if hid is null then
  insert into public.horses(name,breed_id,sex,birth_year,province,description,achievements,published)
  values(payload->>'name',payload->>'breed_id',payload->>'sex',(payload->>'birth_year')::integer,payload->>'province',coalesce(payload->>'description',''),coalesce(payload->>'achievements',''),(payload->>'published')::boolean) returning id into hid;
 else
  update public.horses set name=payload->>'name',breed_id=payload->>'breed_id',sex=payload->>'sex',birth_year=(payload->>'birth_year')::integer,province=payload->>'province',description=coalesce(payload->>'description',''),achievements=coalesce(payload->>'achievements',''),published=(payload->>'published')::boolean where id=hid and owner_id=auth.uid();
  if not found then raise exception 'Horse not found or not owned'; end if;
 end if;
 insert into public.breeding_listings(horse_id,available,preferred_breed_id) values(hid,(payload->>'available')::boolean,nullif(payload->>'preferred_breed_id',''))
 on conflict(horse_id) do update set available=excluded.available,preferred_breed_id=excluded.preferred_breed_id;
 foreach link_role in array array['sire','dam'] loop
  parent := nullif(payload->>link_role,'')::uuid;
  -- Preserve unchanged verified links; editing a link makes it owner-reported.
  if parent is null then
   delete from public.pedigree_relationships where horse_id=hid and role=link_role;
  elsif not exists(select 1 from public.pedigree_relationships where horse_id=hid and role=link_role and parent_id=parent) then
   insert into public.pedigree_relationships(horse_id,parent_id,role) values(hid,parent,link_role)
   on conflict(horse_id,role) do update set parent_id=excluded.parent_id,verified=false;
  end if;
 end loop;
 return hid;
end $$;
revoke all on function public.save_horse(jsonb) from public;
grant execute on function public.save_horse(jsonb) to authenticated;
commit;
