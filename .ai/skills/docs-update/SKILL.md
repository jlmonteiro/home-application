---
name: docs-update
description: >
  Apply documentation updates to the /docs directory following project guidelines.
  Use this skill when the user asks to update, fix, improve, or modify documentation.
  After applying changes, automatically runs the documentation build script to verify.
---

# Documentation Update Skill

## When to Use

Activate this skill when the user asks to:
- Update, fix, or improve documentation in `/docs`
- Add links, examples, or sections to docs
- Apply mkdocs-material layout improvements
- Fix broken links or formatting in docs
- Enhance documentation structure or readability

## Workflow

1. **Read the relevant files** to understand current state
2. **Apply the requested changes** following project conventions
3. **Run the docs build script** to verify changes:
   ```bash
   ./scripts/generate-docs.sh
   # or
   docker run --rm -v $(pwd):/docs squidfunk/mkdocs-material build
   ```
4. **Report results** - success, warnings, or errors

## Guidelines

- Follow existing file structure and conventions
- Use mkdocs-material features (admonitions, tabs, grids, icons) appropriately
- Use icons when applicable. 
  - Some examples:
    - when referring to frameworks or tools (e.g. react, facebook, mail, file, github, etc...)
    - to highlight dos/donts, yes/no, bad/good
    - to provide visual aid with arrows, plus/minus signs, etc...
- Maintain link consistency between docs files
- Keep changes focused on the requested scope
- For new sections, match the tone and detail level of existing content
- Always link resources on different pages (e.g. when referring to a requirement, link to the section where the requirement is defined)
- Watch for warnings when building the docs and fix broken links

## Common Tasks

- Adding/admonitions, tabs, or grid layouts
- Fixing broken internal links
- Adding code examples or API schemas
- Improving readability or organization
- Updating requirement links
- Fixing YAML/JSON syntax errors in code blocks
