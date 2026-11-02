// @ts-check
import { defineConfig } from 'astro/config';

const deployTarget = process.env.PUBLIC_DEPLOY_TARGET ?? '';
const githubPagesPreview = deployTarget === 'github-pages';

// https://astro.build/config
export default defineConfig({
  site: githubPagesPreview ? 'https://yevucee.github.io' : 'https://inventiveafrica.com',
  base: githubPagesPreview ? '/Inventive-Africa' : undefined,
  trailingSlash: 'always',
});
