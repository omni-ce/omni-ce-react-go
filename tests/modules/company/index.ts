import type { Page } from "@playwright/test";
import { checkModuleStart } from "../../variable";

import CompanyEntity from "./company_entity";
import CompanyBranch from "./company_branch";

async function Company(page: Page) {
  if (checkModuleStart("Company", "company", true)) {
    return;
  }

  await CompanyEntity(page);
  await CompanyBranch(page);
}

export default Company;
