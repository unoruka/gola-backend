UPDATE `profiles`
SET `region` = CASE `region`
  WHEN 'IN' THEN 'AS'
  WHEN 'BD' THEN 'AS'
  WHEN 'AE' THEN 'AS'
  WHEN 'US' THEN 'NA'
  WHEN 'CA' THEN 'NA'
  WHEN 'GB' THEN 'EU'
  WHEN 'AU' THEN 'OC'
  WHEN 'AF' THEN 'AF'
  WHEN 'AN' THEN 'AN'
  WHEN 'AS' THEN 'AS'
  WHEN 'EU' THEN 'EU'
  WHEN 'NA' THEN 'NA'
  WHEN 'OC' THEN 'OC'
  WHEN 'SA' THEN 'SA'
  ELSE 'global'
END;
--> statement-breakpoint
DELETE FROM `profiles`
WHERE `handle` <> 'unoruka'
  AND EXISTS (SELECT 1 FROM `profiles` WHERE `handle` = 'unoruka');
