create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('user', 'agent', 'superuser', 'admin');
create type public.membership_status as enum ('pending', 'active', 'suspended');
