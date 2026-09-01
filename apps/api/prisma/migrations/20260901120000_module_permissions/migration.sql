-- Migrate UserPermission enum array → module.action string array

ALTER TABLE "User" ADD COLUMN "permissions_new" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "User"
SET "permissions_new" = sub.grants
FROM (
  SELECT
    u.id,
    COALESCE(
      (
        SELECT array_agg(DISTINCT perm ORDER BY perm)
        FROM (
          SELECT unnest(ARRAY[
            'registration.view',
            'registration.manage',
            'registration.approve',
            'documents.view',
            'documents.manage'
          ]::TEXT[]) AS perm
          WHERE 'STUDENT_REGISTRATION' = ANY(u.permissions)

          UNION ALL

          SELECT unnest(ARRAY['users.manage']::TEXT[]) AS perm
          WHERE 'USER_MANAGEMENT' = ANY(u.permissions)
        ) perms
      ),
      '{}'
    ) AS grants
  FROM "User" u
  WHERE u.role = 'EMPLOYEE'
) sub
WHERE "User".id = sub.id;

ALTER TABLE "User" DROP COLUMN "permissions";
ALTER TABLE "User" RENAME COLUMN "permissions_new" TO "permissions";

DROP TYPE "UserPermission";
