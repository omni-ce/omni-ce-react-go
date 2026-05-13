import type { Page } from "@playwright/test";
import { started, module_selected } from "../../variable";

import CompanyEntity from "./company_entity";
import CompanyBranch from "./company_branch";

async function Company(page: Page) {
  if (started && !module_selected.includes("company")) {
    console.log("Company skip ...");
    return;
  }

  await CompanyEntity(page);
  await CompanyBranch(page);
}

export default Company;
