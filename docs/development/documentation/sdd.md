# Spec-Driven Development (SDD)

## The SDD Philosophy

**Spec-Driven Development (SDD)** is a documentation-first methodology where requirements, architectural design, and implementation plans are formalized in structured markdown *before* any code is written.

---

## 1. Requirements Documentation

Requirements define **What** needs to be built. They are categorized into User Journeys (UJ), Functional Requirements (FR), and Non-Functional Requirements (NFR).

### Standards
- **EARS Syntax:** Every requirement MUST use the structured EARS templates (see legend below).
- **Short Anchors:** Every header MUST include a unique, short ID anchor: `### FR-1: Name {: #fr-1 }`.
- **Rationale:** The business value (So That...) MUST be placed in a `!!! quote "Rationale"` block *after* the criteria.

### EARS Trigger Legend
- :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
- :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
- :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
- :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
- :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."

---

## 2. Design Documentation

Design defines **How** the requirements will be implemented. It covers architecture, database schemas, and UI patterns.

### Standards
- **Mermaid Diagrams:** Use diagrams for flows, hierarchies, and ER relationship.
- **Traceability:** Link design components back to specific FR/NFR anchors.
- **Problem Detail:** Always document error states using the RFC 7807 format.

---

## 3. Roadmap Index

The Roadmap (`docs/specification/roadmap/index.md`) defines the **Sequence of Delivery**. It provides a high-level view of milestones and the feature backlog.

### Standards
- **Milestone Table:** Must track the sequential number, module link, and status icon.
- **Backlog Admonitions:** Future features must be listed as `!!! info` blocks with a brief goal paragraph.

### Template: Roadmap Index
```markdown
# Roadmap & Execution

## Active Roadmap
| Milestone | Module | Status |
| :--- | :--- | :--- |
| **01** | [**Module Name**](01-slug.tasks.md) | :material-check-circle: Completed |

## Backlog
!!! info "Feature Name"
    Brief paragraph explaining goals.
```

---

## 4. Task Files (Execution Plans)

Task files provide the **Transactional Units of Work**. Every milestone MUST have a corresponding `[seq]-[slug].tasks.md` file.

### Standards
- **User Stories:** Follow the format: **As a** [Persona], **I want** [Action], **so that** [Value].
- **Requirement Note:** Every story MUST have a `!!! note "Validates Requirements"` block.
- **Dependencies:** Explicitly link to previous stories within the same or other task files.
- **DoD:** Every task file MUST end with a "Definition of Done" quality checklist.

### Template: Task File
```markdown
# Tasks: [Epic Name]

## 1. User Stories
### US-1: Story Title {: #us-1 }
!!! abstract "Story Definition"
    **As a** [User], **I want** [Goal], **so that** [Value].
    - **Persona:** [Engineer Type]
    - **Estimate:** [X] hours
    - **Dependencies:** [US-X](#us-x)

!!! note "Validates Requirements"
    - [:material-link: **FR-1: Name**](../requirements/file.md#fr-1)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Criterion...

!!! example "Implementation Tasks"
    - [ ] :material-file-code: `Path/to/file.java`
```

---

## 5. Test Strategy & Scenarios

Test documentation defines **Validation**. It ensures the implementation matches the spec.

### Standards
- **Test Scenarios (TS):** Use Given/When/Then syntax with icons.
- **Icon Mapping:** `:material-check-circle:` for Positive cases, `:material-alert-circle:` for Negative cases.
- **Requirement Linkage:** Every TS MUST have a `!!! info "Validates"` block.

---

## 7. Modularization Strategy

As the application grows, documentation for a single domain may become too large for a single file. In these cases, documents MUST be broken down into separate modules.

### Standards
- **Folder per Domain:** Create a sub-directory for the domain (e.g., `docs/specification/requirements/`).
- **The Orchestrator:** The root file (e.g., `requirements.md` or `index.md`) MUST behave as an index and high-level overview.
- **Granularity:** Each sub-file should focus on a specific sub-domain (e.g., `auth-profile.md`, `shopping-list.md`).
- **Grid Navigation:** Index files should use MkDocs **Grid Cards** to provide a visual and descriptive entry point to sub-modules.

### Template: Domain Index File
```markdown
# [Domain] Requirements Index

## Overview
Brief 1-2 paragraph description of the domain's scope.

<div class="grid cards" markdown>

-   :material-account-circle: **[Identity & Profiles](auth-profile.md)**
    
    User registration, profile management, and family role definition.

-   :material-shopping: **[Shopping Module](shopping-list.md)**
    
    Collaborative lists, price tracking, and store management.

</div>

---

## Shared Patterns
Document patterns that apply to ALL sub-modules here (e.g., audit columns, common UI behaviors).
```

---

## 9. Execution Tracking & Persistence

To ensure continuity across sessions and allow for seamless handovers between AI agents (or after context clears), the **Task File** acts as the persistent "source of truth" for current progress.

### Standards
-   **Stateless Operation:** AI agents MUST treat the local task file as their primary memory. Before starting work, the agent must read the file to identify the next pending task.
-   **Atomic Updates:** Upon completing a task or starting a new one, the agent MUST immediately update the task file to reflect the new state.
-   **Granular States:** Progress is tracked at two levels:

| Level | State | Indicator |
| :--- | :--- | :--- |
| **User Story** | Completed | `:material-check-circle:` in header |
| | In Progress | `:material-play-circle:` in header |
| | Pending | `:material-clock-outline:` in header |
| **Implementation Task** | Done | `- [x]` |
| | In Progress | `- [/]` (or `- [ ]` with agent mention) |
| | Pending | `- [ ]` |

### Workflow for AI Agents
1.  **Resume:** Read the current `tasks.md` file. Find the first story marked as In Progress or the first unchecked Implementation Task.
2.  **Act:** Perform the required engineering work.
3.  **Checkpoint:** Update the task file by checking the box or changing the status icon.
4.  **Handoff:** If the session ends, the file state ensures the next agent knows exactly where to pick up.

---

## 8. Architectural Decision Records (ADR)

ADRs document the "Why" behind major technical choices.

### Standards
- **Short Anchors:** Use `{: #adr-x }` for deep linking from design documents.
- **Rationale:** Explicitly state alternatives considered.
