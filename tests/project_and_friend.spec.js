const { test, expect } = require("@playwright/test");

test("test creating a project", async ({ page }) => {
  //Copied same code to create a user from auth.spec.js
  const uniqueId = Date.now();
  const username = `user_${uniqueId}`;
  const email = `test_${uniqueId}@example.com`;
  const password = "password123";

  //register a new user
  await page.goto("/");

  await page.getByRole("link", { name: /create one/i }).click();

  await expect(page).toHaveURL(/\/register/);
  await expect(
    page.getByRole("heading", { name: "Create Account" })
  ).toBeVisible();
  // Fill out the Registration Form
  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/home/);
  await page.getByText("All Projects").click();
  await expect(page).toHaveURL(/\/projects/);
});
