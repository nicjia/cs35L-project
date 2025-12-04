const { test, expect } = require("@playwright/test");

test("User can create tasks that persist after reload", async ({ page }) => {
  //Same code to create a user from auth.spec.js
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

  await page.getByRole("button", { name: "Add New Task" }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await page.getByRole("button", { name: "+ Add Task" }).click();
  await page
    .getByPlaceholder("What needs to be done?")
    .fill("My persistent task");
  await page.getByLabel("Due Date").fill("2025-12-05");
  await page.locator(".task-priority-select").selectOption("Low");
  await page.getByRole("button", { name: "Add Task" }).click();

  //Check for test in list
  await expect(page.getByText("My persistent task")).toBeVisible();
  await page.reload();
  await expect(page.getByText("My persistent task")).toBeVisible();
});
