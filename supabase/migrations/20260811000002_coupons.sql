-- Platform Coupons System
-- Supports platform-specific discount codes with reservation and hard limits

-- Add base_price_cents to platforms table (required for percentage-based coupons)
alter table platforms
add column base_price_cents int;

comment on column platforms.base_price_cents is
  'Base price in cents for this platform. Required for percentage-based coupons. NULL if platform uses custom pricing.';

-- Platform-specific coupon codes
create table platform_coupons (
  code            text primary key,
  platform_id     text not null references platforms(id),
  percent_off     int check (percent_off > 0 and percent_off <= 100),
  amount_off      int check (amount_off > 0),
  max_uses        int not null check (max_uses > 0),
  used_count      int not null default 0 check (used_count >= 0),
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),

  -- Exactly one of percent_off or amount_off must be set
  constraint exactly_one_discount check (
    (percent_off is not null)::int + (amount_off is not null)::int = 1
  )
);

create index on platform_coupons (platform_id);
create index on platform_coupons (expires_at) where expires_at is not null;

comment on table platform_coupons is
  'Platform-specific discount codes. max_uses is a hard limit - code dies when limit reached.';
comment on column platform_coupons.used_count is
  'Increments ONLY on successful payment (state=paid). Never decrements.';

-- Coupon reservations (created when applied, expires with session)
create table platform_coupon_redemptions (
  id           bigserial primary key,
  code         text not null references platform_coupons(code),
  session_id   text not null references sessions(id),
  vai          char(7) references credentials(vai),
  expires_at   timestamptz not null,
  redeemed_at  timestamptz not null default now()
);

create unique index on platform_coupon_redemptions (session_id);
create index on platform_coupon_redemptions (code, expires_at);
create index on platform_coupon_redemptions (vai) where vai is not null;

comment on table platform_coupon_redemptions is
  'Coupon reservations. Created when coupon applied to session. Expires with session to prevent blocking availability.';
comment on column platform_coupon_redemptions.expires_at is
  'Copied from session.expires_at. Reservation only counts toward availability if not expired.';

-- Add coupon tracking to payments
alter table payments
add column coupon_code     text references platform_coupons(code),
add column discount_cents  int not null default 0 check (discount_cents >= 0);

create index on payments (coupon_code) where coupon_code is not null;

comment on column payments.coupon_code is
  'Coupon applied to this payment. NULL if no coupon used.';
comment on column payments.discount_cents is
  'Discount applied in cents. payments.discount_cents + amount_charged = full price.';

-- Trigger: increment used_count ONLY on successful payment
create or replace function increment_coupon_used_count()
returns trigger as $$
begin
  -- Only increment when payment reaches 'paid' state and has a coupon
  if new.state = 'paid' and new.coupon_code is not null and
     (tg_op = 'INSERT' or old.state != 'paid') then

    update platform_coupons
    set used_count = used_count + 1
    where code = new.coupon_code;

  end if;

  return new;
end;
$$ language plpgsql;

create trigger payment_increments_coupon_count
  after insert or update of state on payments
  for each row
  execute function increment_coupon_used_count();

comment on function increment_coupon_used_count() is
  'Increments platform_coupons.used_count when payment reaches paid state. Handles both INSERT (hosted checkout) and UPDATE (standard flow).';

-- RLS: Service role only for now
alter table platform_coupons enable row level security;
alter table platform_coupon_redemptions enable row level security;

create policy "Service role manages coupons"
  on platform_coupons for all to service_role
  using (true) with check (true);

create policy "Service role manages redemptions"
  on platform_coupon_redemptions for all to service_role
  using (true) with check (true);
