# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile Management Behavioral Flow >> User sees validation errors for invalid input
- Location: e2e/profile.spec.ts:80:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/Facebook/i)

```

# Test source

```ts
  1  | import { Page, Locator } from '@playwright/test'
  2  | 
  3  | export class ProfilePage {
  4  |   readonly page: Page
  5  |   readonly title: Locator
  6  |   readonly birthdateInput: Locator
  7  |   readonly familyRoleSelect: Locator
  8  |   readonly mobilePhoneInput: Locator
  9  |   readonly facebookInput: Locator
  10 |   readonly saveButton: Locator
  11 |   readonly successNotification: Locator
  12 | 
  13 |   constructor(page: Page) {
  14 |     this.page = page
  15 |     this.title = page.getByRole('heading', { name: /Profile Settings/i })
  16 |     this.birthdateInput = page.getByLabel(/Birthdate/i)
  17 |     this.familyRoleSelect = page.getByLabel(/Family Role/i)
  18 |     this.mobilePhoneInput = page.getByLabel(/Mobile Phone/i)
  19 |     this.facebookInput = page.getByLabel(/Facebook/i)
  20 |     this.saveButton = page.getByRole('button', { name: /Save Changes/i })
  21 |     this.successNotification = page.getByText(/Your profile has been updated successfully/i)
  22 |   }
  23 | 
  24 |   async goto() {
  25 |     await this.page.goto('/profile')
  26 |   }
  27 | 
  28 |   async updateProfile(details: { mobilePhone?: string; facebook?: string }) {
  29 |     if (details.mobilePhone) {
  30 |       await this.mobilePhoneInput.fill(details.mobilePhone)
  31 |     }
  32 |     if (details.facebook) {
> 33 |       await this.facebookInput.fill(details.facebook)
     |                                ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  34 |     }
  35 |     await this.saveButton.click()
  36 |   }
  37 | }
  38 | 
```