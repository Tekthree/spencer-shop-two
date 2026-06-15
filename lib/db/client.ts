import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is not set');
    _sql = neon(url);
  }
  return _sql;
}

// Proxy so callers can use `sql\`...\`` without changing call sites
const sql = new Proxy(
  ((...args: Parameters<NeonQueryFunction<false, false>>) =>
    getSql()(...args)) as NeonQueryFunction<false, false>,
  {
    get(_target, prop) {
      return getSql()[prop as keyof NeonQueryFunction<false, false>];
    },
  }
);

export default sql;
