// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // This tells React Router to look in src/app for root.tsx,
  // entry.client.tsx, and entry.server.tsx
  appDirectory: "src/client",
  ssr: true, // or false depending on your setup
} satisfies Config;
