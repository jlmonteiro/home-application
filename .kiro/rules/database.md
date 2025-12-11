# Database Rules and Guidelines

## Liquibase Migration Rules

### File Naming Convention
- Use sequential prefixes: `01-description.sql`, `02-description.sql`
- Use descriptive names: `01-create-users-table.sql`
- Use kebab-case for file names
- Never modify existing migration files once merged
- table names should be in singular (e.g., user not users)

### Changeset Guidelines
- One logical change per changeset
- Use meaningful changeset IDs: `author:descriptive-id`
- Always include rollback statements
- Use `--liquibase formatted sql` header

### Schema Changes
- Create schemas before tables: `CREATE SCHEMA IF NOT EXISTS schema_na me`
- Use fully qualified table names: `schema_name.table_name`
- Group related tables in same schema

### Table Design Rules
- Always use `BIGSERIAL` for primary keys
- Use `NOT NULL` constraints where appropriate
- Define foreign key constraints explicitly
- Use meaningful constraint names

### Column Standards
- Use `snake_case` for column names
- Use appropriate data types:
  - `VARCHAR(n)` for limited text
  - `TEXT` for unlimited text
  - `TIMESTAMP` for dates/times
  - `BOOLEAN` for flags
- Set default values where logical

### Index Guidelines
- Create indexes on foreign keys
- Index frequently queried columns
- Use descriptive index names: `idx_table_column`
- Consider composite indexes for multi-column queries

## JPA/Hibernate Rules

### Entity Design
- Map to specific schema: `@Table(name = "table_name", schema = "schema_name")`
- Use `@Id` with `@GeneratedValue(strategy = GenerationType.IDENTITY)`

### Relationship Mapping
- Use `@JoinColumn` with explicit names
- Prefer `LAZY` loading: `@OneToMany(fetch = FetchType.LAZY)`
- Use `@ManyToOne` for foreign key relationships

### Query Guidelines
- Use `@Query` for complex queries
- Prefer JPQL over native SQL when possible
- Use pagination for large result sets
- Implement proper error handling

## Performance Rules

### Query Optimization
- Always use indexes on WHERE clause columns
- Avoid SELECT * in production queries
- Use LIMIT/OFFSET for pagination
- Monitor slow query logs

### Transaction Management
- Keep transactions short
- Use `@Transactional` appropriately
- Handle rollback scenarios
- Avoid nested transactions when possible

## Security Guidelines

### SQL Injection Prevention
- Always use parameterized queries
- Validate input data
- Use JPA/Hibernate query methods
- Never concatenate user input in SQL

## Development Workflow

### Local Development
- Use Docker for consistent database setup

### Testing Rules
- Use Testcontainers for integration tests
- Test migration scripts
- Verify rollback procedures

### Code Review Checklist
- [ ] Migration follows naming convention
- [ ] Rollback statement included
- [ ] Indexes created for foreign keys
- [ ] Entity mappings correct
- [ ] Query performance considered
- [ ] Security implications reviewed

## Monitoring and Maintenance

### Performance Monitoring
- Track query execution times
- Monitor connection pool usage
- Watch for lock contention
- Regular EXPLAIN ANALYZE on slow queries

### Maintenance Tasks
- Regular VACUUM and ANALYZE
- Update table statistics
- Monitor disk usage
- Archive old data when appropriate

## Troubleshooting

### Debug Tools
- Use `EXPLAIN ANALYZE` for query analysis
- Enable SQL logging in development
