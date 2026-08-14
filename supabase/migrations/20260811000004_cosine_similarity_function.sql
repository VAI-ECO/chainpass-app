create or replace function calculate_cosine_similarity(
  baseline_vector vector(512),
  capture_vector text
) returns real
language plpgsql immutable as $$
declare
  distance real;
begin
  -- The <=> operator calculates cosine distance
  -- Cosine similarity = 1 - cosine distance
  distance := baseline_vector <=> capture_vector::vector(512);
  return 1 - distance;
end;
$$;
