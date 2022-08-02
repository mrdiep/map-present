import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from 'fs'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr:
      process.env.CODESANDBOX_SSE || process.env.GITPOD_WORKSPACE_ID
        ? 443
        : undefined,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "images",
          dest: "",
        },
      ],
    }),
    {
      name: 'remove',
  
      transform(src, id) {
        console.log(id)
      }
    }
  ],
});
