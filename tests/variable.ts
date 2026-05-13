import path from "path";

export const frontendUrl = "http://127.0.0.1:5173";
export const backendUrl = "http://127.0.0.1:3000";

export const pwd = process.cwd();
export const asset_test = path.join(pwd, "assets", "test");

export const started_exist: boolean[] = [];
export const argv = process.env.CLI_ARGS
  ? (JSON.parse(process.env.CLI_ARGS) as string[])
  : process.argv;
export const args = argv.slice(2);
export const module_selected = args.slice(2);
