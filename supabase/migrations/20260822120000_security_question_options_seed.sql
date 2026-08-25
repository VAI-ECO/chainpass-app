INSERT INTO public.security_question_options (question_text, category, is_active)
SELECT v.question_text, v.category, true
FROM (
  VALUES
    ('What was the name of your first pet?', 'memory'),
    ('What city were you living in at age ten?', 'memory'),
    ('What was the first concert you attended?', 'memory'),
    ('What is the middle name of your oldest sibling?', 'family'),
    ('What was the make of your first car?', 'memory'),
    ('What street did you grow up on?', 'memory')
) AS v(question_text, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.security_question_options o WHERE o.question_text = v.question_text
);
