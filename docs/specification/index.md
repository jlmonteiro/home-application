# Spec-Driven Development (SDD)

## The SDD Philosophy

**Spec-Driven Development (SDD)** is a documentation-first methodology where requirements, architectural design, and implementation plans are formalized in structured markdown *before* any code is written.

<div class="grid cards" markdown>

-   :material-magnify: **Traceability**
    
    Every single line of code, test case, and UI component is directly traceable to a verified requirement.

-   :material-school: **Rapid Onboarding**
    
    New team members can gain a complete understanding of the system's "Why" and "How" by reading the specification first.

-   :material-shield-check: **Scope Control**
    
    Explicitly defined boundaries prevent scope creep and ensure that every feature adds measurable value.

-   :material-history: **Living Documentation**
    
    Specifications are first-class artifacts that evolve alongside the code, providing a permanent audit trail of decisions.

</div>

---

## Workflow Comparison

| Aspect | :material-file-document-edit: **SDD** | :material-lightning-bolt: **Vibe Coding** |
| :--- | :--- | :--- |
| **Start Point** | Requirements documentation | Raw idea or code |
| **Artifacts** | Spec, Design, Tasks, Code | Code only |
| **Review Process** | Logic & Impact validation | Syntactic correctness |
| **Scalability** | High (Teams/Complex systems) | Low (Solo/Small projects) |
| **Maintenance** | Proactive (Source of Truth) | Reactive (Reverse engineering) |

---

## Document Structure

The specification is organized into a hierarchical structure to ensure clarity and ease of navigation.

<div class="grid cards" markdown>

-   :material-clipboard-list: **[Requirements](requirements/requirements.md)**
    
    Functional (FR) and Non-Functional (NFR) requirements grouped by domain.

-   :material-pencil-ruler: **[Design](design/design.md)**
    
    High-level architecture, database schema, and module-specific implementation details.

-   :material-test-tube: **[Test Strategy](design/test-strategy/architecture.md)**
    
    Verification plans, test pyramid definition, and linkable test scenarios.

-   :material-map-clock: **[Roadmap](roadmap/index.md)**
    
    Sequential feature rollout and task-level execution plans.

</div>

---

## SDD Lifecycle

1.  :material-numeric-1-circle: **Init:** Establish the structure and inspect the baseline.
2.  :material-numeric-2-circle: **Requirements:** Define exactly *What* needs to be built.
3.  :material-numeric-3-circle: **Design:** Plan *How* it will be implemented and verified.
4.  :material-numeric-4-circle: **Tasking:** Break down the design into transactional units of work.
5.  :material-numeric-5-circle: **Execution:** Implement and validate against the spec.
