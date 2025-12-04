const { test, expect } = require("@playwright/test");

test("User can register and then log in", async ({ page }) => {
  //create a new user based on the current time so credentials are never taken
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

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("/");

  //Test faulty login credentials
  const uniqueId2 = Date.now();
  const faulty_email = `test_${uniqueId2}@example.com`;
  const faulty_password = "password123";
  await page.getByLabel("Email").fill(faulty_email);
  await page.getByLabel("Password").fill(faulty_password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});

test("registration rejects same username or same email", async ({ page }) => {
  //create a new user based on the current time so credentials are never taken
  const newId = Date.now() + 7;
  const username2 = `user_${newId}`;
  const email2 = `test_${newId}@example.com`;
  const password2 = "password123";

  //register a new user
  await page.goto("/");

  await page.getByRole("link", { name: /create one/i }).click();

  await expect(page).toHaveURL(/\/register/);
  await expect(
    page.getByRole("heading", { name: "Create Account" })
  ).toBeVisible();

  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Username").fill(username2);
  await page.getByLabel("Email").fill(email2);
  await page.getByLabel("Password").fill(password2);

  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/home/);
  await page.getByRole("button", { name: "Logout" }).click();

  await page.getByRole("link", { name: /create one/i }).click();
  await expect(page).toHaveURL(/\/register/);

  //Test same username registration
  const uniqueId2 = Date.now();
  const unique_username = "user_" + uniqueId2;
  const unique_email = "user_" + uniqueId2 + "@example.com";
  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Username").fill(username2);
  await page.getByLabel("Email").fill(unique_email);
  await page.getByLabel("Password").fill(password2);

  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("Username already in use")).toBeVisible();

  //Test same email registration
  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Username").fill(unique_username);
  await page.getByLabel("Email").fill(email2);
  await page.getByLabel("Password").fill(password2);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("Email already in use")).toBeVisible();

  //Both existing emails and usernames are rejected
  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Username").fill(username2);
  await page.getByLabel("Email").fill(email2);
  await page.getByLabel("Password").fill(password2);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/register/);
});
