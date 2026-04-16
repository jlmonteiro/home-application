# Documentation Guidelines

## Overview

High-quality documentation is a first-class citizen in the Home Application ecosystem. This document defines the general standards, visual patterns, and workflows for maintaining professional, interactive documentation.

!!! info "Spec-Driven Development (SDD)"
    For requirements syntax (EARS), persistent anchors, and methodology-specific standards, refer to the **[SDD Guidelines](sdd.md)**.

---

## Directory Structure

All documentation source files are stored in the `docs/` directory and written in GitHub Flavored Markdown.

| Location | Content Type |
| :--- | :--- |
| `docs/help/` | User-facing guides and environment setup tutorials. |
| `docs/development/` | Technical guidelines, coding standards, and AI context. |
| `docs/specification/requirements/` | Functional and Non-Functional requirements. |
| `docs/specification/design/` | Architectural design, ER diagrams, and UI patterns. |
| `docs/specification/roadmap/` | Transactional task files and feature backlogs. |

---

## Visual Patterns & UI

We leverage **MkDocs Material** features to provide a modern, interactive experience.

### 1. Admonitions
Use admonitions to categorize information and improve scannability.

-   `!!! success`: Used for positive results or criteria (See SDD for Requirements usage).
-   `!!! quote`: Used for rationale or citations.
-   `!!! info`: General information, definitions, or User Journeys.
-   `!!! abstract`: Architectural decisions or high-level summaries.
-   `!!! warning`: Critical security or operational notices.
-   `!!! tip`: Useful hints, shortcuts, or implementation advice.

### 2. Layout Elements
-   **Grid Cards:** Use `<div class="grid cards" markdown>` for high-level overviews or feature lists.
-   **Tabs:** Use content tabs (`=== "Title"`) to separate Backend, Frontend, or specific technical layers.
-   **Icons:** Use integrated icons (e.g., `:material-check-all:`, `:simple-spring:`) to provide visual cues.

---

## Technical Standards

### 1. Diagrams
Use **Mermaid.js** for all architectural and database diagrams.
-   Use `erDiagram` for individual schema details.
-   Use `flowchart TB` with `subgraph` for high-level multi-domain overviews.

### 2. File Naming
-   Use kebab-case for file and directory names (e.g., `user-profile.md`).
-   Group related files into logical sub-directories.

---

## Build & Validation

The documentation site is generated as a static HTML artifact.

### Build Command
```bash
./scripts/generate-docs.sh
```

### Handling Build Output
-   **Warnings:** MkDocs warnings regarding broken links or missing anchors MUST be fixed immediately.
-   **Navigation:** Ensure any new page is explicitly added to the `nav` section of `mkdocs.yml`.
-   **Dead Links:** Use the build log to identify and repair incorrect relative paths.

---

## AI Alignment

AI agents assisting in documentation updates MUST:
1.  Run the build script to validate link integrity before completing a task.
2.  Maintain visual consistency by using established admonition and layout patterns.
3.  Prioritize clarity and brevity in help guides and tutorials.
