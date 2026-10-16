// Next.js 16 lint rules (flat config). `npm run lint` checks; it never rewrites files.
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [...nextVitals, { ignores: [".next/**", "archive/**", "public/**"] }];

export default eslintConfig;
