# Software Design Document (SDD) Guidelines

## Purpose

Software Design Documents use a three-file pattern (requirements, design, tasks) to separate concerns and maintain clarity throughout the development lifecycle. This approach ensures traceability from requirements through implementation while remaining compatible with Kiro IDE workflows.

## Three-File Pattern

### File Structure

```
.kiro/specs/
├── 01-authentication/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── 02-user-profile/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── 03-feature-name/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

### Folder Naming Convention
- Use sequential numeric prefix: `01-`, `02-`, `03-`
- Use kebab-case for feature name: `authentication`, `user-profile`, `payment-processing`
- Keep names brief and descriptive
- Format: `{number}-{feature-name}/`

### 1. Requirements File (`requirements.md`)

**Purpose:** Define WHAT needs to be built from a business/user perspective

**Location:** `.kiro/specs/{number}-{feature-name}/requirements.md`

**Required Sections:**
- **Overview** - Feature purpose and business value
- **User Stories** - As a [role], I want [goal], so that [benefit]
- **Functional Requirements** - Specific capabilities the system must provide
- **Non-Functional Requirements** - Performance, security, scalability constraints
- **Acceptance Criteria** - Conditions that must be met for completion
- **Out of Scope** - Explicitly excluded items
- **Dependencies** - External systems, services, or prerequisites

**Format:**
- Use numbered requirements (REQ-001, REQ-002)
- Keep business-focused, avoid technical implementation details
- Include success metrics where applicable
- Reference user personas or roles

### 2. Design File (`design.md`)

**Purpose:** Define HOW the requirements will be implemented technically

**Location:** `.kiro/specs/{number}-{feature-name}/design.md`

**Required Sections:**
- **Architecture Overview** - High-level component design
- **API Specifications** - Endpoints, request/response formats, status codes
- **Data Model** - Entities, DTOs, relationships, validation rules
- **Component Design** - Controllers, services, repositories structure
- **Security Design** - Authentication, authorization, data protection
- **Error Handling** - Exception types, error responses, recovery strategies
- **Integration Points** - External APIs, databases, message queues
- **Technology Decisions** - Framework choices, libraries, rationale

**Format:**
- Reference requirements by ID (implements REQ-001)
- Include code examples and API contracts
- Use diagrams for complex flows
- Document design trade-offs and alternatives considered

### 3. Tasks File (`tasks.md`)

**Purpose:** Break down design into actionable implementation tasks

**Location:** `.kiro/specs/{number}-{feature-name}/tasks.md`

**Required Sections:**
- **Task List** - Ordered, granular implementation steps
- **Dependencies** - Task ordering and prerequisites
- **Estimates** - Time/complexity estimates (optional)
- **Status Tracking** - Todo, In Progress, Done, Blocked

**Format:**
- Use checkboxes for task tracking: `- [ ] Task description`
- Reference design sections: "Implement API endpoint (see design.md#api-spec)"
- Include testing tasks for each feature task
- Group related tasks together

**Example:**
```markdown
## Database Tasks
- [ ] Create user_profile table migration (REQ-001)
- [ ] Add indexes on email column
- [ ] Write rollback script

## Backend Tasks
- [ ] Create UserProfile entity (Design: Data Model)
- [ ] Implement UserProfileRepository
- [ ] Implement UserProfileService with validation
- [ ] Create UserProfileController with GET/PUT endpoints
- [ ] Add global exception handling

## Testing Tasks
- [ ] Unit tests for UserProfileService
- [ ] Integration tests for UserProfile API
- [ ] Load test data SQL scripts
```

## File Naming and Location

- All specs live in `.kiro/specs/` directory
- Each feature gets its own numbered folder: `.kiro/specs/{number}-{feature-name}/`
- Use sequential numbering: `01-`, `02-`, `03-`
- Use kebab-case for folder names: `user-profile`, `authentication`, `payment-processing`
- Each folder contains exactly three files: `requirements.md`, `design.md`, `tasks.md`
- Reference specs from main README.md or project documentation

## Formatting Standards

### Headings
- Use markdown heading hierarchy (##, ###, ####)
- Use descriptive, action-oriented titles
- Number requirements (REQ-001) and major design sections

### Code Examples
- Use fenced code blocks with language identifiers
- Include inline comments for clarity
- Show both request and response examples for APIs

### Diagrams
- Use ASCII art for simple component diagrams
- Reference external diagram files (D2) when complex
- Keep diagrams in design file

### Tables
- Use markdown tables for API endpoints, configuration, and comparisons
- Include headers: Method, Endpoint, Description, Request, Response
- Document all status codes and error scenarios

## API Documentation Standards (Design File)

### Endpoint Specification
```markdown
| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| GET | /api/resource/{id} | Retrieve resource | - | ResourceDTO | 200, 404 |
| POST | /api/resource | Create resource | ResourceDTO | ResourceDTO | 201, 400 |
```

### Request/Response Examples
- Include curl commands for testing
- Show JSON payloads with proper formatting
- Document all required and optional fields
- Specify validation rules and constraints

### Error Responses
- Document error response structure
- List all possible error codes
- Provide troubleshooting guidance

## Data Model Documentation (Design File)

### Entity Specifications
- List all fields with types and constraints
- Document relationships (OneToMany, ManyToOne, etc.)
- Include validation rules
- Reference database schema files

### DTO Specifications
- Separate from entity documentation
- Document transformation logic (entity ↔ dto)
- List validation annotations
- Show example JSON payloads

## Workflow Integration

### 1. Requirements Phase
- Create new folder: `.kiro/specs/{next-number}-{feature-name}/`
- Create `requirements.md` first
- Gather business requirements and user stories
- Define acceptance criteria
- Review with stakeholders
- Get approval before moving to design

### 2. Design Phase
- Create `design.md` in same folder based on approved requirements
- Reference requirements by ID throughout
- Document technical approach and architecture
- Include API contracts and data models
- Review with technical team
- Update requirements if gaps discovered

### 3. Task Breakdown Phase
- Create `tasks.md` in same folder from design document
- Break design into granular, actionable tasks
- Order tasks by dependencies
- Include testing tasks for each feature
- Estimate complexity/effort
- Assign to team members

### 4. Implementation Phase
- Work through tasks in order
- Check off completed tasks: `- [x] Task description`
- Update design if implementation reveals issues
- Keep all three files in sync
- Reference spec folder in commit messages

### 5. Review Phase
- Validate implementation against requirements
- Verify all acceptance criteria met
- Update design with any deviations
- Mark all tasks complete
- Document lessons learned

## Maintenance Guidelines

### Version Control
- Commit all three files together
- Update files when requirements change
- Maintain change history in git
- Archive completed feature docs

### Synchronization
- Keep requirements, design, and tasks aligned
- Update design when requirements change
- Update tasks when design evolves
- Cross-reference between files

### Traceability
- Requirements → Design: "Implements REQ-001"
- Design → Tasks: "See design.md#api-specifications"
- Tasks → Code: Reference in commit messages
- Code → Tests: Link test cases to requirements

## Kiro IDE Integration

### Context Usage
- Place specs in `.kiro/specs/` for automatic context inclusion
- Reference specific spec folders when asking Kiro for help
- Use `requirements.md` for feature clarification
- Use `design.md` for implementation guidance
- Use `tasks.md` for progress tracking

### Rule References
- Link to `.kiro/rules/` files for detailed guidelines
- Example: "Follow `.kiro/rules/database.md` for schema standards"
- Avoid duplicating rules in design docs
- Keep design high-level, rules detailed

### Automation Opportunities
- Use Kiro to generate initial requirements from user stories
- Ask Kiro to create design from requirements
- Generate task breakdown from design document
- Validate implementation against design specifications
- Update documentation as code evolves
- Create new spec folders with proper numbering

## Best Practices

### Requirements File
- Focus on business value and user needs
- Avoid technical implementation details
- Use clear, testable acceptance criteria
- Include non-functional requirements
- Document assumptions and constraints

### Design File
- Reference requirements explicitly
- Document design decisions and rationale
- Include alternatives considered
- Provide complete API specifications
- Show data flow and component interactions

### Tasks File
- Make tasks small and actionable (< 4 hours)
- Include testing tasks for each feature
- Order by dependencies
- Update status regularly
- Track blockers and issues

## Common Pitfalls to Avoid

- ❌ Writing design before requirements are approved
- ❌ Creating tasks without detailed design
- ❌ Mixing business requirements with technical design
- ❌ Letting files become out of sync
- ❌ Skipping non-functional requirements
- ❌ Missing error handling in design
- ❌ Tasks too large or vague
- ❌ No traceability between files
- ❌ Forgetting to update docs during implementation

## Review Checklist

### Requirements File
- [ ] Clear business value stated
- [ ] User stories follow standard format
- [ ] Functional requirements numbered and testable
- [ ] Non-functional requirements included
- [ ] Acceptance criteria defined
- [ ] Out of scope items listed
- [ ] Dependencies identified

### Design File
- [ ] All requirements referenced
- [ ] Architecture overview provided
- [ ] API endpoints fully specified
- [ ] Data models documented
- [ ] Error handling strategy defined
- [ ] Security considerations addressed
- [ ] Integration points documented
- [ ] Design trade-offs explained

### Tasks File
- [ ] All design components have tasks
- [ ] Tasks are granular and actionable
- [ ] Dependencies clearly marked
- [ ] Testing tasks included
- [ ] Status tracking in place
- [ ] Tasks reference design sections

## Template Usage

### Starting a New Feature
1. Determine next sequential number (check `.kiro/specs/` for highest number)
2. Create folder: `.kiro/specs/{number}-{feature-name}/`
3. Create `requirements.md` from business needs
4. Review and approve requirements
5. Create `design.md` with technical approach
6. Review design with team
7. Create `tasks.md` with implementation breakdown
8. Begin implementation, tracking progress in tasks file

### Updating Existing Feature
1. Navigate to `.kiro/specs/{number}-{feature-name}/`
2. Update `requirements.md` with new needs
3. Modify `design.md` to accommodate changes
4. Add/update tasks in `tasks.md` as needed
5. Mark affected tasks for rework
6. Implement changes
7. Update all three files to reflect final state

## Integration with Project Rules

- Follow `.kiro/rules/java.md` for code structure in design
- Reference `.kiro/rules/database.md` for schema design
- Apply `.kiro/rules/tests.md` when creating testing tasks
- Use `.kiro/rules/gradle-build.md` for build-related tasks
- Ensure design aligns with all project standards
