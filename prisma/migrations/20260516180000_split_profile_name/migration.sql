-- Split full_name into first_name and last_name
ALTER TABLE "profiles" ADD COLUMN "first_name" VARCHAR(100);
ALTER TABLE "profiles" ADD COLUMN "last_name" VARCHAR(100);

UPDATE "profiles"
SET
  "last_name" = CASE
    WHEN position(' ' IN "full_name") > 0 THEN split_part("full_name", ' ', 1)
    ELSE "full_name"
  END,
  "first_name" = CASE
    WHEN position(' ' IN "full_name") > 0 THEN trim(substring("full_name" FROM length(split_part("full_name", ' ', 1)) + 2))
    ELSE "full_name"
  END;

ALTER TABLE "profiles" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "profiles" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "profiles" DROP COLUMN "full_name";
