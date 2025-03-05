# Ubikial Development Instructions

This document provides guidelines for developing Ubikial in a safe, iterative approach to reach a Minimum Viable Product (MVP) status.

## Project Overview

Ubikial is an AI-powered platform for managing multiple social media personas and cross-posting content. The core value proposition is allowing users to write content once and have it adapted to different platforms and personas automatically.

## Development Philosophy

1. **Iterative Development**: Build in small, testable increments
2. **Feature Prioritization**: Focus on core value first, then expand
3. **Continuous Testing**: Test each component as it's built
4. **User Feedback**: Incorporate feedback at each stage
5. **Technical Debt Management**: Refactor regularly, don't let technical debt accumulate

## AI-Human Collaboration Model

This project operates under an AI-first development model where the AI system is the primary developer and technical lead:

1. **AI Leadership & Decision Making**:
   - AI makes all technical decisions independently
   - Architectural choices are determined by AI based on best practices
   - Implementation approaches are decided by AI
   - Code structure and patterns are AI-directed
   - Project timeline and priorities are AI-managed

2. **Human Support Role**:
   - Humans provide domain knowledge when requested
   - Context and clarification are provided on demand
   - Business requirements are conveyed to AI
   - Technical constraints are communicated when relevant
   - Testing assistance is provided when needed

3. **Communication Protocol**:
   - AI drives all technical discussions
   - AI determines when input is needed
   - AI defines implementation specifics
   - AI sets coding standards
   - No permission needed for technical decisions

4. **Quality Standards**:
   - AI enforces all quality standards
   - AI determines when code is ready
   - AI decides when to refactor
   - AI manages technical debt
   - AI controls deployment readiness

The AI system owns the development process entirely, making all technical decisions while leveraging human expertise as needed. Humans support the AI's decisions and provide input when requested, but do not need to approve or authorize technical choices.

## Development Phases

### Phase 1: Foundation (COMPLETED)

**Goal**: Set up project architecture and basic authentication

1. **Project Setup**
   - ✅ Initialize React + TypeScript project with Vite
   - ✅ Configure Tailwind CSS
   - ✅ Set up routing with React Router
   - ✅ Create landing page with value proposition

2. **Authentication System**
   - ✅ Create login/signup pages
   - ✅ Implement JWT authentication
   - ✅ Set up protected routes
   - ✅ Build user profile management
   - ✅ Store auth tokens in localStorage

3. **Basic Navigation**
   - ✅ Create dashboard layout
   - ✅ Implement responsive sidebar
   - ✅ Add user settings page

**Implementation Notes**: The authentication system uses localStorage for token management with a simulated JWT implementation. For demonstration purposes, a test account feature has been added to make testing easier.

**Testing Criteria**: ✅ Users can sign up, log in, and navigate between pages securely.

### Phase 2: Persona Management (COMPLETED)

**Goal**: Enable users to create and manage personas

1. **Persona Creation**
   - ✅ Build persona creation form
   - ✅ Implement persona listing UI
   - ✅ Create persona editing capabilities
   - ✅ Add persona deletion with confirmation

2. **Persona Storage**
   - ✅ Implement GitHub API integration
   - ✅ Set up repository creation for personas
   - ✅ Create proper error handling for API failures
   - ✅ Add offline fallback with localStorage

3. **Persona Settings**
   - ✅ Create UI for persona configuration
   - ✅ Implement tone/style settings
   - ✅ Add platform-specific settings

**Implementation Notes**: Persona management has been implemented with dual storage capabilities - both localStorage and GitHub. The system falls back to localStorage when GitHub is unavailable or not connected, ensuring data persistence even when offline.

**Testing Criteria**: ✅ Users can create, edit, and delete personas with proper data persistence.

### Phase 3: Social Media Integration (COMPLETED)

**Goal**: Connect to social media platforms

1. **Platform Connection**
   - ✅ Implement OAuth flows for major platforms (Twitter, LinkedIn, Facebook, Instagram)
   - ✅ Create connection management UI
   - ✅ Build platform-specific settings

2. **Account Management**
   - ✅ Create UI for managing connected accounts
   - ✅ Implement account status monitoring
   - ✅ Add reconnection flows for expired tokens

3. **Security Considerations**
   - ✅ Ensure secure token storage
   - ✅ Implement proper scopes for API access
   - ✅ Create clear permission explanations

**Implementation Notes**: 
- OAuth flows have been implemented with comprehensive security features including state validation, PKCE support, and clear permission explanations.
- Account status monitoring checks for token expiration and provides reconnection flows when needed.
- Token encryption is used to protect sensitive credentials in localStorage.
- A permissions consent screen explains exactly what the application is requesting, enhancing transparency.

**Testing Criteria**: ✅ Users can connect accounts from at least two major platforms (Twitter and LinkedIn) and see their status.

### Phase 4: Content Creation & Cross-Posting (IN PROGRESS)

**Goal**: Enable core functionality of content creation and platform-specific adaptation

1. **Content Editor**
   - ✅ Build rich text editor
   - ✅ Implement media upload capabilities
   - ✅ Create content preview functionality
   - ✅ Add draft saving with localStorage

2. **AI Integration** (IN PROGRESS)
   - ✅ Create "Bring Your Own API" system
   - ✅ Implement API key management
   - ✅ Build prompt engineering system
   - ✅ Add fallback for when AI is unavailable

3. **Content Adaptation**
   - ⬜ Create adaptation preview
   - ⬜ Implement manual override capabilities
   - ⬜ Build platform-specific formatting
   - ⬜ Add character count and limitations

4. **Publishing System**
   - ⬜ Implement immediate publishing
   - ⬜ Create scheduling functionality
   - ⬜ Add publishing queue
   - ⬜ Implement retry logic for failed posts

**Implementation Notes**:
- The content editor implements a rich text experience with basic formatting options
- Media upload supports adding and previewing images
- Platform-specific previews show how content will appear on different networks
- Automatic draft saving ensures users never lose their work
- AI integration supports multiple providers including Mistral, OpenAI, Anthropic, Google, and custom APIs
- API key management includes secure storage, verification, and testing
- The prompt template system provides pre-defined templates for tasks like tone shifting and platform adaptation
- Graceful fallbacks ensure the system works even when AI services are unavailable

**Testing Criteria**: Users should be able to write a post once and have it appropriately adapted and published to multiple platforms.

### Phase 5: Refinement & Analytics (PLANNED)

**Goal**: Add analytics and refine the user experience

1. **Basic Analytics**
   - ⬜ Implement post performance tracking
   - ⬜ Create analytics dashboard
   - ⬜ Add export functionality

2. **User Experience Improvements**
   - ⬜ Add onboarding flow
   - ⬜ Implement tooltips and guides
   - ⬜ Create keyboard shortcuts

3. **Feedback System**
   - ⬜ Add in-app feedback mechanism
   - ⬜ Implement feature request system
   - ⬜ Create error reporting

**Testing Criteria**: Users should be able to track basic performance metrics and have a smooth, intuitive experience.

## MVP Definition

The Minimum Viable Product should include:

1. ✅ User authentication and account management
2. ✅ Creation and management of at least 2 personas
3. ✅ Connection to at least 2 social media platforms
4. ✅ Basic content creation and editing
5. ✅ AI-powered adaptation between platforms
6. ⬜ Cross-posting to connected accounts
7. ⬜ Basic analytics for published posts

## Implementation Guidelines

### Code Organization

- Keep components modular and reusable
- Use TypeScript interfaces for all data structures
- Maintain clear separation of concerns
- Document complex logic with comments
- Create utilities for common functions

### State Management

- Use React Context for global state
- Leverage localStorage for persistence
- Implement proper loading and error states
- Create clear actions for state mutations

### API Integration

- Create service classes for external APIs
- Implement proper rate limiting
- Add caching where appropriate
- Build comprehensive error handling

### Security Best Practices

- ✅ Store tokens securely with encryption
- ✅ Implement OAuth with proper state validation
- ✅ Provide clear permission explanations and consent screens
- ✅ Add API request validation
- ✅ Create timeout handling for external services
- ✅ Implement fallback mechanisms for failed connections

## Testing Strategy

### Unit Testing

- Test individual components with Jest
- Create mocks for external dependencies
- Verify component rendering and interactions

### Integration Testing

- Test user flows across multiple components
- Verify data persistence
- Test authentication flows

### Manual Testing

- Create test scenarios for each feature
- Test on multiple browsers and devices
- Verify accessibility compliance

## Deployment Considerations

### Staging Environment

- Set up a staging environment that mirrors production
- Implement continuous integration
- Add automated testing in CI pipeline

### Production Deployment

- Use a CDN for static assets
- Implement proper caching strategies
- Set up monitoring and alerting
- Create backup and recovery procedures

### Post-Deployment

- Monitor error rates and performance
- Collect user feedback
- Plan iterative improvements

## Next Steps After MVP

1. Expand platform support
2. Enhance AI capabilities
3. Add team collaboration features
4. Implement advanced analytics
5. Create mobile applications

By following these instructions, you'll build Ubikial in a methodical, iterative way that prioritizes core functionality while maintaining code quality and security best practices.
