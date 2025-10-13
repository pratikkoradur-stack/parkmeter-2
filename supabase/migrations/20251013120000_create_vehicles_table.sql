-- Migration: create vehicles table
-- Run this in your Supabase SQL editor or include in your migration pipeline

create table if not exists vehicles (
  id uuid default gen_random_uuid() primary key,
  plate text not null,
  owner text not null,
  model text,
  color text,
  type text,
  contact text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists vehicles_plate_idx on vehicles(plate);
