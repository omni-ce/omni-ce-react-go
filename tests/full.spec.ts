import { test } from "@playwright/test";

import { playNotification } from "./function";
import Prepare from "./prepare";
import Landing from "./landing";
import Login from "./login";

// Module ...
import Role from "./modules/role";
import User from "./modules/user";
import Company from "./modules/company";

test("Full Testing", async ({ page }) => {
  try {
    await Prepare(page);
    await Landing(page);
    await Login(page); // Super Admin

    // ---------------------------------------------- //
    // Module ...

    await Role(page);
    await User(page);
    await Company(page);

    // ---------------------------------------------- //
    // wait for navigation or success
    // await expect(page).toHaveURL(/.*select-role/); // for user not su

    // Keep the browser open after finish
    await playNotification("finish");
    await page.pause();
  } catch (err) {
    await playNotification("error");
    throw err;
  }
});
