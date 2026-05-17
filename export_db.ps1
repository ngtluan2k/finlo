# ==============================
# EXPORT POSTGRES -> MYSQL
# ==============================

$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_USER = "postgres"
$PG_DB   = "finlo"
$PG_PASSWORD = "25052000"

$MYSQL_DB = "if0_41936306_finlo"

$OUTPUT_DIR = "./db_export"
$PG_SCHEMA_FILE = "$OUTPUT_DIR/postgres_schema.sql"
$PG_DATA_FILE   = "$OUTPUT_DIR/postgres_data.sql"
$MYSQL_FILE     = "$OUTPUT_DIR/mysql_dump.sql"

New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
$env:PGPASSWORD = $PG_PASSWORD

Write-Host "Exporting PostgreSQL schema..."

pg_dump `
  -h $PG_HOST `
  -p $PG_PORT `
  -U $PG_USER `
  -d $PG_DB `
  --schema=public `
  --schema-only `
  --no-owner `
  --no-privileges `
  -f $PG_SCHEMA_FILE

if ($LASTEXITCODE -ne 0) {
  Write-Error "Schema export failed."
  exit 1
}

Write-Host "Exporting PostgreSQL data..."

pg_dump `
  -h $PG_HOST `
  -p $PG_PORT `
  -U $PG_USER `
  -d $PG_DB `
  --schema=public `
  --data-only `
  --inserts `
  --column-inserts `
  --no-owner `
  --no-privileges `
  -f $PG_DATA_FILE

if ($LASTEXITCODE -ne 0) {
  Write-Error "Data export failed."
  exit 1
}

$schema = Get-Content $PG_SCHEMA_FILE -Raw
$data   = Get-Content $PG_DATA_FILE -Raw

$mysqlHeader = @"
CREATE DATABASE IF NOT EXISTS `$MYSQL_DB`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `$MYSQL_DB`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

"@

# Remove comments
$schema = $schema -replace '(?m)^--.*$', ''
$data   = $data -replace '(?m)^--.*$', ''

# Remove PostgreSQL global lines
$patterns = @(
  '(?m)^SET .*$',
  '(?m)^SELECT pg_catalog.*$',
  '(?m)^CREATE SCHEMA.*$',
  '(?m)^ALTER SCHEMA.*$',
  '(?m)^COMMENT ON .*$',
  '(?m)^CREATE EXTENSION.*$',
  '(?m)^ALTER EXTENSION.*$',
  '(?m)^REVOKE .*$',
  '(?m)^GRANT .*$',
  '(?m)^ALTER TABLE .* OWNER TO.*$',
  '(?m)^ALTER SEQUENCE .* OWNER TO.*$',
  '(?m)^SELECT pg_catalog.setval.*$'
)

foreach ($p in $patterns) {
  $schema = $schema -replace $p, ''
  $data   = $data -replace $p, ''
}

# Remove sequences
$schema = $schema -replace '(?s)CREATE SEQUENCE.*?;\s*', ''
$schema = $schema -replace '(?s)ALTER SEQUENCE.*?;\s*', ''

# Remove enum definitions
$schema = $schema -replace '(?s)CREATE TYPE\s+.*?AS ENUM\s*\(.*?\);\s*', ''

# Remove casts before type conversion
$castPatterns = @(
  "::character varying",
  "::text",
  "::uuid",
  "::bpchar",
  "::jsonb",
  "::json"
)

foreach ($cast in $castPatterns) {
  $schema = $schema -replace [regex]::Escape($cast), ''
  $data   = $data -replace [regex]::Escape($cast), ''
}

$schema = $schema -replace '::public\."?[A-Za-z0-9_]+"?', ''
$schema = $schema -replace '::"?[A-Za-z0-9_]+"?', ''
$data   = $data -replace '::public\."?[A-Za-z0-9_]+"?', ''
$data   = $data -replace '::"?[A-Za-z0-9_]+"?', ''

# Enum types -> VARCHAR(50)
$enumTypes = @(
  "AttachmentCategory",
  "AttachmentEntityType",
  "AttachmentStatus",
  "CategoryType",
  "Gender",
  "PermissionStatus",
  "RecordStatus",
  "RecurrenceFrequency",
  "RoleStatus",
  "TransactionStatus",
  "TransactionType",
  "UserStatus",
  "VerificationChannel",
  "WalletType"
)

foreach ($enum in $enumTypes) {
  $schema = $schema -replace "public\.""$enum""", "VARCHAR(50)"
  $schema = $schema -replace """$enum""", "VARCHAR(50)"
}

# Type conversion
$schema = $schema -replace '\buuid\b', 'CHAR(36)'
$schema = $schema -replace '\bcharacter varying\(([0-9]+)\)', 'VARCHAR($1)'
$schema = $schema -replace '\bcharacter varying\b', 'VARCHAR(255)'
$schema = $schema -replace '\bcharacter\(([0-9]+)\)', 'CHAR($1)'
$schema = $schema -replace '\btimestamp\([0-9]+\) without time zone\b', 'DATETIME'
$schema = $schema -replace '\btimestamp\([0-9]+\) with time zone\b', 'DATETIME'
$schema = $schema -replace '\btimestamp without time zone\b', 'DATETIME'
$schema = $schema -replace '\btimestamp with time zone\b', 'DATETIME'
$schema = $schema -replace '\bboolean\b', 'TINYINT(1)'
$schema = $schema -replace '\bjsonb\b', 'JSON'
$schema = $schema -replace '\bjson\b', 'JSON'
$schema = $schema -replace '\btext\b', 'TEXT'
$schema = $schema -replace '\binteger\b', 'INT'
$schema = $schema -replace '\bbigint\b', 'BIGINT'
$schema = $schema -replace '\bnumeric\(([0-9]+),([0-9]+)\)', 'DECIMAL($1,$2)'
$schema = $schema -replace '\bnumeric\b', 'DECIMAL(15,2)'
$schema = $schema -replace '\bdouble precision\b', 'DOUBLE'
$schema = $schema -replace '\breal\b', 'FLOAT'
$schema = $schema -replace '\bdate\b', 'DATE'

# Fix broken cast leftovers
$schema = $schema -replace "'([^']*)'\s+varying", "'`$1'"
$data   = $data -replace "'([^']*)'\s+varying", "'`$1'"

# Identifiers
$schema = $schema -replace 'public\.', ''
$data   = $data -replace 'public\.', ''
$schema = $schema -replace '"', '`'
$data   = $data -replace '"', '`'

# Defaults
$schema = $schema -replace '\bnow\(\)', 'CURRENT_TIMESTAMP'
$schema = $schema -replace 'DEFAULT CURRENT_TIMESTAMP\(\)', 'DEFAULT CURRENT_TIMESTAMP'

# ALTER TABLE ONLY
$schema = $schema -replace '\bALTER TABLE ONLY\b', 'ALTER TABLE'

# ==============================
# REMOVE CHECK CONSTRAINTS FIXED
# ==============================

# Remove inline PostgreSQL CHECK constraint in CREATE TABLE
$schema = $schema -replace '(?s),\s*CONSTRAINT\s+`?[^`\s]+`?\s+CHECK\s+\(\(\(.*?\)\)\)\s*(?=\r?\n\))', ''

# Fallback remove any remaining CHECK constraint line/block
$schema = $schema -replace '(?s),\s*CONSTRAINT\s+`?[^`\s]+`?\s+CHECK\s+\(.*?\)\s*(?=\r?\n\))', ''

# Remove standalone ALTER TABLE ADD CHECK if any
$schema = $schema -replace '(?s)ALTER TABLE\s+[^;]+ADD CONSTRAINT\s+[^;]+CHECK\s+\(.*?\);\s*', ''

# ==============================
# INDEX CONVERSION FIXED
# ==============================

$schema = $schema -replace '\s+USING btree', ''

$schema = $schema -replace `
'CREATE UNIQUE INDEX\s+([^\s]+)\s+ON\s+([^\s]+)\s+\(([^)]+)\)\s+WHERE\s+\([\s\S]*?\);', `
'CREATE UNIQUE INDEX $1 ON $2 ($3);'

$schema = $schema -replace `
'CREATE INDEX\s+([^\s]+)\s+ON\s+([^\s]+)\s+\(([^)]+)\)\s+WHERE\s+\([\s\S]*?\);', `
'CREATE INDEX $1 ON $2 ($3);'

$schema = $schema -replace '\s+AND\s+\([^)]+\)\)', ')'
$schema = $schema -replace '\)\)', ')'

# Data values
$data = $data -replace '\btrue\b', '1'
$data = $data -replace '\bfalse\b', '0'

# Fix datetime timezone values
$data = $data -replace "'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\+\d{2}'", "'$1'"
$data = $data -replace "'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\+\d{2}:\d{2}'", "'$1'"

# Add ENGINE to CREATE TABLE
$schema = [regex]::Replace(
  $schema,
  '(?s)(CREATE TABLE\s+`?[^`\s(]+`?\s*\(.*?\)\s*);',
  '$1 ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
)

# Final cleanup
$schema = $schema -replace ',\s*\)', "`r`n)"
$schema = $schema -replace "`r?`n{3,}", "`r`n`r`n"
$data   = $data -replace "`r?`n{3,}", "`r`n`r`n"

$content =
  $mysqlHeader +
  $schema +
  "`r`n" +
  $data +
  "`r`nSET FOREIGN_KEY_CHECKS = 1;`r`n"

$fullPath = [System.IO.Path]::GetFullPath($MYSQL_FILE)

[System.IO.File]::WriteAllText(
  $fullPath,
  $content,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "====================================="
Write-Host "EXPORT SUCCESS"
Write-Host "====================================="
Write-Host "Schema: $PG_SCHEMA_FILE"
Write-Host "Data:   $PG_DATA_FILE"
Write-Host "MySQL:  $MYSQL_FILE"
Write-Host "====================================="