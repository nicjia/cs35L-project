// tests/auth.spec.js
const { test, expect } = require("@playwright/test");

test("User can register and then log in", async ({ page }) => {
  //create a new user based on the current time so it is never taken
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

  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  //Logout out and test if we can log in now
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("/"); // Test for login form

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/home/);
});
