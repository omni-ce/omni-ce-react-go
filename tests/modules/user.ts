import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
} from "../function";
import { checkModuleStart } from "../variable";

async function User(page: Page) {
  if (checkModuleStart("User", "user")) {
    return;
  }

  //# Add New User
  // click menu user
  await buttonClick(page, ".sidebar-menu-user");

  // click button add
  await buttonClick(page, ".user-pagination-button-add");

  // upload foto user, class: field-file-avatar
  await inputFile(page, ".field-file-avatar", "sandhika-galih.jpeg");

  // input nama lengkap user, class: field-text-name
  await inputFill(page, ".field-text-name", "Sandhika Galih");

  // input username, class: field-text-username
  await inputFill(page, ".field-text-username", "sandhikagalih");

  // input password, class: field-text-password
  await inputFill(page, ".field-text-password", "SandhikaGalih@123", 3000);

  // input email, class: field-email-email
  await inputFill(page, ".field-email-email", "sandhikagalih@test.com");

  // input phone, class: field-phone-phone
  await inputFill(page, ".field-phone-phone", "8123456789");

  await scrollDown(page, ".user-pagination-dialog");

  await selectAddress(page, "jawa", "kota ban", "anta", "tengah");

  // Divisi Role Pertama
  await buttonClick(page, ".roles-array-button-add", 1500);
  await scrollDown(page, ".user-pagination-dialog", 300);

  // Pilih Role Divisi Pertama: Management
  await buttonClick(
    page,
    ".item-field-roles-0-division_id #field-division_id",
    1000,
  );
  await inputFill(
    page,
    ".field-division_id-searchable-select-input",
    "management",
  );
  await buttonClick(page, "#searchable-select-portal button", 1500);

  // Pilih Role Jabatan Pertama: Admin
  await buttonClick(page, ".item-field-roles-0-role_id #field-role_id", 1000);
  await inputFill(page, ".field-role_id-searchable-select-input", "admin");
  await buttonClick(page, "#searchable-select-portal button", 1500);

  // Divisi Role Kedua
  await buttonClick(page, ".roles-array-button-add", 1500);
  await scrollDown(page, ".user-pagination-dialog", 300);

  // Pilih Role Divisi Kedua: Management
  await buttonClick(
    page,
    ".item-field-roles-1-division_id #field-division_id",
    1000,
  );
  await inputFill(
    page,
    ".field-division_id-searchable-select-input",
    "management",
  );
  await buttonClick(page, "#searchable-select-portal button", 1500);

  // Pilih Role Jabatan Kedua: Operator
  await buttonClick(page, ".item-field-roles-1-role_id #field-role_id", 1000);
  await inputFill(page, ".field-role_id-searchable-select-input", "operator");
  await buttonClick(page, "#searchable-select-portal button", 1500);

  // Click Save ...
  await buttonClick(page, ".user-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default User;
