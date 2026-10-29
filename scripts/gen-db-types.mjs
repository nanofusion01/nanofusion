#!/usr/bin/env node
/**
 * Vygeneruje TypeScript typy databáze z živého Supabase schématu (PostgREST
 * OpenAPI) a zapíše je do obou aplikací:
 *   admin-panel/lib/database.types.ts
 *   new-frontend/src/lib/database.types.ts
 *
 * Náhrada za `supabase gen types typescript`, která nevyžaduje přihlášení
 * do Supabase CLI - stačí URL projektu a service role klíč z
 * admin-panel/.env.local (nebo z proměnných prostředí).
 *
 * Spuštění z kořene repozitáře:  npm run gen:types
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^['"]|['"]$/g, "")])
  );
}

const env = { ...loadEnv(path.join(root, "admin-panel/.env.local")), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY (admin-panel/.env.local).");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/openapi+json" },
});
if (!res.ok) {
  console.error(`OpenAPI request failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const spec = await res.json();

// Funkce, které v DB ještě nemusí být (migrace čeká na spuštění) - ať typy
// odpovídají kódu, který je volá. Po spuštění migrace se vezmou z DB.
const EXTRA_FUNCTIONS = {
  check_rate_limit: { args: { p_key: "string", p_limit: "number", p_window_seconds: "number" }, returns: "boolean" },
};
// OpenAPI neobsahuje návratové typy funkcí
const FUNCTION_RETURNS = { is_admin: "boolean", is_admin_or_editor: "boolean", check_rate_limit: "boolean" };

function tsType(prop) {
  if (prop.enum) return prop.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (prop.type === "array") return `${wrap(tsType(prop.items ?? {}))}[]`;
  const f = (prop.format ?? "").replace(/\[\]$/, "");
  const isArray = (prop.format ?? "").endsWith("[]");
  let t;
  if (["json", "jsonb"].includes(f)) t = "Json";
  else if (prop.type === "boolean" || f === "boolean") t = "boolean";
  else if (prop.type === "integer" || prop.type === "number") t = "number";
  else if (prop.type === "string") t = "string";
  else t = "unknown";
  return isArray ? `${t}[]` : t;
}
const wrap = (t) => (t.includes("|") ? `(${t})` : t);
const prop = (name) => (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) ? name : JSON.stringify(name));

const tables = Object.keys(spec.definitions ?? {}).sort();
let out = `// AUTOMATICKY GENEROVÁNO skriptem scripts/gen-db-types.mjs - neupravovat ručně.
// Obnovení: npm run gen:types (z kořene repozitáře)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
`;

for (const t of tables) {
  const def = spec.definitions[t];
  const required = new Set(def.required ?? []);
  const cols = Object.entries(def.properties ?? {});
  const row = cols.map(([c, p]) => `          ${prop(c)}: ${tsType(p)}${required.has(c) ? "" : " | null"}`);
  const ins = cols.map(([c, p]) => {
    const optional = !required.has(c) || p.default !== undefined;
    return `          ${prop(c)}${optional ? "?" : ""}: ${tsType(p)}${required.has(c) ? "" : " | null"}`;
  });
  const upd = cols.map(([c, p]) => `          ${prop(c)}?: ${tsType(p)}${required.has(c) ? "" : " | null"}`);
  out += `      ${prop(t)}: {
        Row: {
${row.join("\n")}
        }
        Insert: {
${ins.join("\n")}
        }
        Update: {
${upd.join("\n")}
        }
        Relationships: []
      }
`;
}

out += `    }
    Views: {
      [_ in never]: never
    }
    Functions: {
`;

const functions = {};
for (const [p, item] of Object.entries(spec.paths ?? {})) {
  const m = p.match(/^\/rpc\/(.+)$/);
  if (!m) continue;
  const schema = item.post?.parameters?.find((x) => x.in === "body")?.schema;
  const args = Object.fromEntries(Object.entries(schema?.properties ?? {}).map(([k, v]) => [k, tsType(v)]));
  functions[m[1]] = { args, returns: FUNCTION_RETURNS[m[1]] ?? "unknown" };
}
for (const [name, fn] of Object.entries(EXTRA_FUNCTIONS)) functions[name] ??= fn;

for (const name of Object.keys(functions).sort()) {
  const { args, returns } = functions[name];
  const argEntries = Object.entries(args);
  const argsType = argEntries.length
    ? `{\n${argEntries.map(([k, v]) => `          ${prop(k)}: ${v}`).join("\n")}\n        }`
    : "never";
  out += `      ${prop(name)}: {
        Args: ${argsType}
        Returns: ${returns}
      }
`;
}

out += `    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicTables = Database['public']['Tables']

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row']
export type Inserts<T extends keyof PublicTables> = PublicTables[T]['Insert']
export type Updates<T extends keyof PublicTables> = PublicTables[T]['Update']
export type TablesInsert<T extends keyof PublicTables> = Inserts<T>
export type TablesUpdate<T extends keyof PublicTables> = Updates<T>
`;

for (const target of ["admin-panel/lib/database.types.ts", "new-frontend/src/lib/database.types.ts"]) {
  fs.writeFileSync(path.join(root, target), out);
  console.log(`✓ ${target} (${tables.length} tabulek, ${Object.keys(functions).length} funkcí)`);
}
