-- Apply once through Supabase SQL Editor or the Supabase migration CLI.
-- No drops or destructive changes. Existing name conflicts fail the transaction.
begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 display_name text not null default 'Адуу сонирхогч' check (length(display_name) between 1 and 100),
 province text not null default '', bio text not null default '' check(length(bio)<=2000),
 published boolean not null default false, created_at timestamptz not null default now()
);
-- Contact details never belong in the public profile table.
create table public.profile_contacts (
 user_id uuid primary key references public.profiles on delete cascade,
 phone text not null default '' check(length(phone)<=50)
);
create table public.breeds (id text primary key, name text not null unique);
insert into public.breeds values ('mongolian','Монгол'),('thoroughbred','Цэвэр цусны англи'),('arabian','Араб'),('imported','Бусад импортын'),('crossbreed','Эрлийз');
create table public.horses (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 name text not null check(length(name) between 1 and 100), breed_id text not null references public.breeds,
 sex text not null check(sex in ('stallion','mare','gelding')), birth_year integer not null check(birth_year between 1950 and 2100),
 province text not null check(length(province) between 1 and 100), description text not null default '' check(length(description)<=5000),
 achievements text not null default '' check(length(achievements)<=5000),
 published boolean not null default false, verified boolean not null default false,
 created_at timestamptz not null default now()
);
create index horses_owner_idx on public.horses(owner_id);
create index horses_discovery_idx on public.horses(published,breed_id,province,sex);
create index horses_name_idx on public.horses(lower(name) text_pattern_ops);
create table public.pedigree_relationships (
 horse_id uuid not null references public.horses on delete cascade,
 parent_id uuid not null references public.horses on delete restrict,
 role text not null check(role in ('sire','dam')), verified boolean not null default false,
 primary key(horse_id,role), unique(horse_id,parent_id), check(horse_id<>parent_id)
);
create index pedigree_parent_idx on public.pedigree_relationships(parent_id);
create table public.breeding_listings (
 horse_id uuid primary key references public.horses on delete cascade,
 available boolean not null default false,
 preferred_breed_id text references public.breeds,
 notes text not null default '' check(length(notes)<=2000)
);
create table public.saved_candidates (
 user_id uuid not null default auth.uid() references public.profiles on delete cascade,
 horse_id uuid not null references public.horses on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,horse_id)
);
create table public.inquiries (
 id uuid primary key default gen_random_uuid(), sender_id uuid not null default auth.uid() references public.profiles on delete cascade,
 recipient_id uuid not null references public.profiles on delete cascade,
 horse_id uuid not null references public.horses on delete cascade,
 message text not null check(length(message) between 10 and 2000),
 created_at timestamptz not null default now(), check(sender_id<>recipient_id)
);
create index inquiries_recipient_idx on public.inquiries(recipient_id,created_at desc);
create index inquiries_sender_idx on public.inquiries(sender_id,created_at desc);
create function public.on_signup() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,display_name) values(new.id, left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Адуу сонирхогч'),100));
 return new;
end $$;
create trigger aduumatch_signup after insert on auth.users for each row execute function public.on_signup();
-- Existing auth accounts get profiles without changing existing records.
insert into public.profiles(id) select id from auth.users on conflict do nothing;

create function public.guard_horse() returns trigger language plpgsql set search_path = '' as $$
begin
 if new.birth_year > extract(year from current_date) then raise exception 'Birth year is in the future'; end if;
 if current_user in ('anon','authenticated') then
  if tg_op='INSERT' and new.verified then raise exception 'Verification requires an administrator'; end if;
  if tg_op='UPDATE' and (new.verified is distinct from old.verified or new.owner_id<>old.owner_id or new.id<>old.id) then raise exception 'Protected horse fields'; end if;
 end if;
 if tg_op='UPDATE' and (new.sex<>old.sex or new.birth_year<>old.birth_year) and exists(select 1 from public.pedigree_relationships where parent_id=new.id or horse_id=new.id) then
  raise exception 'Remove pedigree links before changing sex or birth year';
 end if;
 return new;
end $$;
create trigger guard_horse before insert or update on public.horses for each row execute function public.guard_horse();

create function public.guard_pedigree() returns trigger language plpgsql security definer set search_path = '' as $$
declare p public.horses; c public.horses;
begin
 -- Serialize ancestry edits, including edits across owners.
 perform pg_advisory_xact_lock(70422091);
 select * into p from public.horses where id=new.parent_id;
 select * into c from public.horses where id=new.horse_id;
 if auth.role() = 'authenticated' then
  if c.owner_id<>auth.uid() then raise exception 'Not your horse'; end if;
  if not p.published and p.owner_id<>auth.uid() then raise exception 'Parent is not accessible'; end if;
  if new.verified then raise exception 'Verification requires an administrator'; end if;
 end if;
 if p.sex <> (case new.role when 'sire' then 'stallion' else 'mare' end) then raise exception 'Parent sex does not match role'; end if;
 if p.birth_year>=c.birth_year then raise exception 'Parent must be older than offspring'; end if;
 if exists (
  with recursive ancestors(id) as (
   select new.parent_id union select r.parent_id from public.pedigree_relationships r join ancestors a on r.horse_id=a.id
  ) select 1 from ancestors where id=new.horse_id
 ) then raise exception 'Circular ancestry is forbidden'; end if;
 return new;
end $$;
create trigger guard_pedigree before insert or update on public.pedigree_relationships for each row execute function public.guard_pedigree();

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.breeds enable row level security;
alter table public.horses enable row level security;
alter table public.pedigree_relationships enable row level security;
alter table public.breeding_listings enable row level security;
alter table public.saved_candidates enable row level security;
alter table public.inquiries enable row level security;
create policy profiles_read on public.profiles for select using(published or id=auth.uid());
create policy profiles_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy contacts_owner on public.profile_contacts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy breeds_read on public.breeds for select using(true);
create policy horses_read on public.horses for select using(published or owner_id=auth.uid());
create policy horses_insert on public.horses for insert to authenticated with check(owner_id=auth.uid() and not verified);
create policy horses_update on public.horses for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy horses_delete on public.horses for delete to authenticated using(owner_id=auth.uid());
create policy pedigree_read on public.pedigree_relationships for select using(
 exists(select 1 from public.horses where id=horse_id) and exists(select 1 from public.horses where id=parent_id)
);
create policy pedigree_write on public.pedigree_relationships for all to authenticated using(
 exists(select 1 from public.horses where id=horse_id and owner_id=auth.uid())
) with check(exists(select 1 from public.horses where id=horse_id and owner_id=auth.uid()) and not verified);
create policy listings_read on public.breeding_listings for select using(exists(select 1 from public.horses where id=horse_id));
create policy listings_write on public.breeding_listings for all to authenticated using(exists(select 1 from public.horses where id=horse_id and owner_id=auth.uid())) with check(exists(select 1 from public.horses where id=horse_id and owner_id=auth.uid()));
create policy saved_owner on public.saved_candidates for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.horses where id=horse_id));
create policy inquiries_read on public.inquiries for select to authenticated using(sender_id=auth.uid() or recipient_id=auth.uid());
create policy inquiries_insert on public.inquiries for insert to authenticated with check(
 sender_id=auth.uid() and exists(select 1 from public.horses where id=horse_id and owner_id=recipient_id and published)
);
grant select on public.breeds, public.horses, public.profiles, public.pedigree_relationships, public.breeding_listings to anon, authenticated;
grant insert,update,delete on public.horses,public.pedigree_relationships,public.breeding_listings,public.saved_candidates,public.profile_contacts to authenticated;
grant select on public.saved_candidates,public.profile_contacts,public.inquiries to authenticated;
grant update on public.profiles to authenticated;
grant insert on public.inquiries to authenticated;
revoke all on function public.on_signup() from public;
revoke all on function public.guard_pedigree() from public;

-- Private bucket: signed downloads still require object SELECT permission.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('horse-photos','horse-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy horse_photos_read on storage.objects for select using(bucket_id='horse-photos' and exists(
 select 1 from public.horses h where h.id::text=(storage.foldername(name))[2] and h.owner_id::text=(storage.foldername(name))[1]
));
create policy horse_photos_insert on storage.objects for insert to authenticated with check(bucket_id='horse-photos' and exists(
 select 1 from public.horses h where h.id::text=(storage.foldername(name))[2] and h.owner_id=auth.uid() and h.owner_id::text=(storage.foldername(name))[1]
));
create policy horse_photos_delete on storage.objects for delete to authenticated using(bucket_id='horse-photos' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
