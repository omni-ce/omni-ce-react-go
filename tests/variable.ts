import path from "path";

export const frontendUrl = "http://127.0.0.1:5173";
export const backendUrl = "http://127.0.0.1:3000";

export const pwd = process.cwd();
export const asset_test = path.join(pwd, "assets", "test");

// eslint-disable-next-line prefer-const
export let started_exist = false;
export const argv = process.argv;
export const args = argv.slice(2);
export const started =
  args.includes("--start") || args.includes("start") || !!process.env.START;
