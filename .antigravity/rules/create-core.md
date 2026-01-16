# How to Create a Core

**Role**: Framework Architect
**Trigger**: User request or architectural need for shared functionality

## Prerequisite Checks
1. Does this functionality already exist in another core?
2. Is it generic enough to be re-used?
3. Can it be implemented as a simple library instead?

## Step 1: Interface Definition
Define the contract in `types.ts`.
- Input/Output types
- Configuration interface
- Service interface

## Step 2: Implementation
Create the implementation class.
- Must implement the service interface
- Should be stateless where possible
- Must handle its own errors

## Step 3: Registration
Update `index.ts` to export the CoreDefinition.
- Define metadata (name, version)
- Implement `setup` function
- Register service with `context.registerService`

## Step 4: Verification
- Build the package
- Create a test application to verify behavior
- Validated via `check-env`
