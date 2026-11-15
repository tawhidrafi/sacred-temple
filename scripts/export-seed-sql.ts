import fs from "node:fs";
import path from "node:path";
import { Database } from "bun:sqlite";

function findLocalD1Path(): string | null {
  const d1Dir = path.resolve(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  if (!fs.existsSync(d1Dir)) return null;
  const files = fs.readdirSync(d1Dir);
  const dbFile = files.find((f) => f.endsWith(".sqlite") && !f.startsWith("metadata"));
  return dbFile ? path.join(d1Dir, dbFile) : null;
}

function escapeSqlString(val: string): string {
  return `'${val.replace(/'/g, "''")}'`;
}

function formatSqlValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  return escapeSqlString(String(val));
}

export function generateSeedSql(): string {
  console.log("[seed-sql] Generating drizzle/seed.sql from local database...");

  const dbPath = findLocalD1Path();
  if (!dbPath) {
    throw new Error("[seed-sql] Local D1 database file not found. Run 'bun run seed' first.");
  }

  const sqlite = new Database(dbPath);

  // Tables to seed (content only, skip transient sessions/audit logs)
  const tables = [
    "home_cms",
    "daily_schedule",
    "pujas",
    "deities",
    "events",
    "notices",
    "pages",
    "albums",
    "album_items",
  ];

  const sqlStatements: string[] = [
    "-- ========================================================",
    "-- Sacred Project - Seed Data for Cloudflare D1",
    `-- Generated on: ${new Date().toISOString()}`,
    "-- Run with: npx wrangler d1 execute DB --remote --file=sql/seed.sql",
    "-- Or paste into Cloudflare Dashboard -> D1 -> Console",
    "-- ========================================================",
    "",
  ];

  for (const table of tables) {
    try {
      const rows = sqlite.query(`SELECT * FROM ${table}`).all() as Record<string, any>[];
      if (rows.length === 0) continue;

      sqlStatements.push(`-- Table: ${table} (${rows.length} rows)`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const colList = columns.map((c) => `\`${c}\``).join(", ");
        const valList = columns.map((c) => formatSqlValue(row[c])).join(", ");

        sqlStatements.push(
          `INSERT OR REPLACE INTO \`${table}\` (${colList}) VALUES (${valList});`
        );
      }
      sqlStatements.push("");
    } catch (err: any) {
      console.warn(`[seed-sql] Warning for table ${table}:`, err?.message);
    }
  }

  const outPath = path.resolve(process.cwd(), "sql", "seed.sql");
  fs.writeFileSync(outPath, sqlStatements.join("\n"), "utf-8");

  console.log(`[seed-sql] ✅ Seed SQL successfully written to: ${outPath}`);
  return outPath;
}

if (import.meta.main) {
  try {
    generateSeedSql();
  } catch (err) {
    console.error("[seed-sql] Error:", err);
    process.exit(1);
  }
}
