# Spring HATEOAS & PagedModel

Spring HATEOAS provides APIs to create REST representations that follow the HATEOAS (Hypermedia as the Engine of Application State) principle.

## Concrete Wrapper Classes (Best Practice)
Spring HATEOAS generics (e.g., `ResponseEntity<PagedModel<EntityModel<DTO>>>`) are extremely verbose. The best practice is to hide this complexity using concrete wrappers and an Assembler.

### 1. `Resource` Wrapper (`EntityModel<T>`)
Create a dedicated class for your single resource:
```java
public class UserResource extends EntityModel<UserDTO> {
    public UserResource(UserDTO content, Iterable<Link> links) { super(content, links); }
}
```

### 2. `PagedResource` Wrapper (`PagedModel<T>`)
Create a dedicated class for your paginated collection:
```java
public class PagedUserResource extends PagedModel<UserResource> {
    public PagedUserResource(Collection<UserResource> content, PageMetadata metadata, Iterable<Link> links) { 
        super(content, metadata, links); 
    }
}
```

### 3. `ResourceAssembler`
Centralize the logic of converting a DTO to a Resource and generating standard links:
```java
@Component
public class UserResourceAssembler extends RepresentationModelAssemblerSupport<UserDTO, UserResource> {
    public UserResourceAssembler() { super(UserController.class, UserResource.class); }

    @Override
    public UserResource toModel(UserDTO entity) {
        return new UserResource(entity,
                linkTo(methodOn(UserController.class).get(entity.getId())).withSelfRel(),
                linkTo(methodOn(UserController.class).list(Pageable.unpaged())).withRel("collection"));
    }
}
```

### 4. Clean Controller Usage
Inject the `PagedResourcesAssembler` alongside your custom `ResourceAssembler`:
```java
@GetMapping
public ResponseEntity<PagedUserResource> list(Pageable pageable) {
    Page<UserDTO> page = userService.findAll(pageable);
    
    PagedModel<UserResource> pagedModel = pagedResourcesAssembler.toModel(page, userResourceAssembler);
    PagedUserResource resource = new PagedUserResource(pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks());
    
    return ResponseEntity.ok(resource);
}
```

## Benefits
- **Clean Signatures**: Controllers return `ResponseEntity<PagedUserResource>` instead of nested generic nightmares.
- **Centralized Links**: The `Assembler` handles URL generation, making controllers purely focused on HTTP mechanics.
- **Standardized Pagination**: Clients get a consistent format for navigation (`first`, `prev`, `self`, `next`, `last`).
