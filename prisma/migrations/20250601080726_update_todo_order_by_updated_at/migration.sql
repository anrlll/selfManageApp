-- Update existing todos to set order based on updatedAt
UPDATE "Todo"
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "updatedAt" ASC) - 1 as row_num
  FROM "Todo"
) as subquery
WHERE "Todo".id = subquery.id; 