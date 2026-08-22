-- Canon §1.1a: the credential price key is price_vai. price_vai_standard is retired.
UPDATE public.settings
  SET key = 'price_vai'
  WHERE key = 'price_vai_standard';

DELETE FROM public.settings WHERE key = 'price_vai_standard';
