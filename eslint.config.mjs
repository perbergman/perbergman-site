// Flat config for ESLint 9 + eslint-config-next 16 (Next.js 16 removed `next lint`).
// eslint-config-next now ships a native flat-config array, so it is spread directly.
import next from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "OLD/**", "scripts/**"] },
  ...next,
];

export default eslintConfig;
