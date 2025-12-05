const { test, expect } = require("@playwright/test");

test("test creating a project with tasks", async ({ page }) => {
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
  await page.getByRole("button", { name: "+ New Project" }).click();
  await page.getByPlaceholder("Enter project name").fill("My First Project");
  await page
    .getByPlaceholder("Describe your project...")
    .fill("This is a test project.");
  await page
    .getByRole("button", { name: "Create Project", exact: true })
    .click();
  await expect(page.getByText("My First Project")).toBeVisible();
  await expect(page.getByText("This is a test project.")).toBeVisible();

  //Try adding a task within the project
  await page
    .locator(".project-card")
    .filter({ hasText: "My First Project" })
    .locator(".add-task-btn")
    .click();
  await expect(page).toHaveURL(/\/projects/);

  //Fill out new task form
  await page.getByPlaceholder("What needs to be done?").fill("Project Task 1");
  await page
    .locator(".modal-content")
    .getByRole("button", { name: "Add Task" })
    .click();
  await expect(page.getByText("Project Task 1")).toBeVisible();
});
