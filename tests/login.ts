import { type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

import { buttonClick, inputFill, playNotification } from "./function";
import { pwd } from "./variable";

async function Login(page: Page) {
  // 2. Access Login
  await buttonClick(page, 'a[href*="login"], a[href*="dashboard"]');

  // ambil username dan password memakai fs
  const userModelPath = path.resolve(
    pwd,
    "core/modules/user/model/user.model.go",
  );
  const userModelContent = fs.readFileSync(userModelPath, "utf-8");

  const usernameMatch = /Username:\s*"([^"]+)"/.exec(userModelContent);
  const passwordMatch = /Password:\s*hash\.Password\("([^"]+)"\)/.exec(
    userModelContent,
  );

  const username = usernameMatch ? usernameMatch[1] : "";
  const password = passwordMatch ? passwordMatch[1] : "";

  // insert ke field
  await inputFill(page, ".field-username", username);
  await inputFill(page, ".field-password", password);
  await buttonClick(page, 'button[type="submit"]', 500);

  // 2:end delay
  await playNotification("section");
}

export default Login;
