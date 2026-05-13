import { expect, test } from "@playwright/test";

import { argv, args, module_selected } from "./variable";
import { playNotification } from "./function";

import Prepare from "./prepare";
import Landing from "./landing";
import Login from "./login";

// Module ...
import Role from "./modules/role";
import User from "./modules/user";
import Company from "./modules/company";
import Product from "./modules/product";

test("Full Testing", async ({ page }) => {
  // console.log({ argv, args, module_selected });
  // expect(true).toBeTruthy();
  // return;

  try {
    await Prepare(page);
    await Landing(page);
    await Login(page); // Super Admin

    // ---------------------------------------------- //
    // Module ...

    await Role(page);
    await User(page);
    await Company(page);
    await Product(page);

    // ---------------------------------------------- //
    // wait for navigation or success
    // await expect(page).toHaveURL(/.*select-role/); // for user not su

    // Keep the browser open after finish
    await playNotification("finish", 0.5);
    await page.pause();
  } catch (err) {
    await playNotification("error");
    throw err;
  }
});
