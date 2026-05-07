# Growth Track & Member Management Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for the user-facing growth track system, first timer registration, and member management features.

## Current State Analysis (Updated)

### Database Schema (Already Implemented)

- **FirstTimer** table: Captures initial visitor information with fields for personal details, conversion status, and member linkage
- **Member** table: Full membership database with growth level tracking
- **GrowthStage**: Defines 8 levels from NEW_COMER to ADVANCED_LEADERSHIP_3
- **GrowthContent**: Stores lessons (video, text, PDF) for each stage
- **GrowthQuestion**: Assessment questions for each stage
- **MemberProgress**: Tracks member progress through growth stages

### Admin Features (Already Implemented)

- Growth track content management at `/admin/growth-track`
- Ability to add lessons and assessment questions per stage
- Content types: VIDEO, TEXT, PDF

### Completed Features (As of Current Update)

✅ **First Timer Registration**

- Registration form exists at `/[slug]/join` (visitor option)
- Updated API to use FirstTimer table instead of just Visitor table
- Added duplicate detection and conversion tracking

✅ **Member Registration & Lookup**

- Registration form exists at `/[slug]/join` (member option)
- Smart lookup system at `/member/register` with phone/email verification
- Shows current growth level and next actions for existing members
- Auto-links first timers who become members

✅ **API Endpoints**

- `/api/assemblies/[slug]/register` - Handles both first timer and member registration
- `/api/member/lookup` - Smart lookup with growth track status
- `/api/admin/first-timers/[id]` - Update first timer status
- `/api/admin/members/[id]` - Update member growth level

✅ **Admin Interfaces**

- `/admin/first-timers` - View and manage all first timers
- `/admin/members` - View members with growth track progress
- Added navigation links in admin sidebar

### Still Missing Features

1. User-facing growth track interface
2. Lesson/content viewing system
3. Assessment/test functionality
4. Progress tracking through lessons
5. Certificate generation

## Implementation Plan

### Phase 1: First Timer Registration System

#### 1.1 Create First Timer Registration Page

**Location**: `/src/app/(public)/first-timer/page.jsx`
**Features**:

- Public accessible form for church visitors
- Fields matching FirstTimer schema
- Optional assembly selection (defaults to HQ if not selected)
- Prayer request section
- "Give your life to Christ" checkbox
- Follow-up preference selection

#### 1.2 First Timer API Endpoint

**Location**: `/src/app/api/public/first-timer/route.js`
**Methods**:

- POST: Create new first timer record
- Validate phone/email uniqueness
- Check if already exists as member
- Send notification to assembly admin

#### 1.3 Admin First Timer Management

**Location**: `/src/app/admin/(protected)/first-timers/page.jsx`
**Features**:

- List all first timers for the assembly
- Filter by: followed up status, conversion status, date range
- Quick actions: Mark as followed up, Convert to member
- Export functionality for follow-up teams

### Phase 2: Member Registration & Lookup System

#### 2.1 Smart Member Registration Page

**Location**: `/src/app/(public)/member/page.jsx`
**Flow**:

1. Initial lookup form (phone or email)
2. If found in FirstTimer/Member:
   - Display current status
   - Show growth level
   - Show next required action
3. If not found:
   - Full membership registration form
   - Auto-populate from first timer data if exists

#### 2.2 Member API Endpoints

**Location**: `/src/app/api/public/member/route.js`
**Endpoints**:

- POST `/lookup`: Check if phone/email exists
- POST `/register`: Create new member
- GET `/status/:identifier`: Get member status and growth level

#### 2.3 Member Status Response Structure

```javascript
{
  exists: true,
  type: 'MEMBER' | 'FIRST_TIMER',
  data: {
    name: 'John Doe',
    currentLevel: 'FOUNDATIONAL_CLASS',
    nextAction: {
      type: 'LESSON' | 'TEST' | 'COMPLETE',
      description: 'Complete Foundational Class Lesson 3',
      url: '/growth-track/foundational-class/lesson-3'
    },
    progress: {
      currentStage: 'FOUNDATIONAL_CLASS',
      completedLessons: 2,
      totalLessons: 5,
      testScore: null
    }
  }
}
```

### Phase 3: Growth Track User Interface

#### 3.1 Growth Track Portal

**Location**: `/src/app/(public)/growth-track/page.jsx`
**Features**:

- Member authentication via phone/email
- Display current growth stage
- Show available content for current level
- Track lesson completion
- Access to assessment when ready

#### 3.2 Individual Stage Pages

**Location**: `/src/app/(public)/growth-track/[stage]/page.jsx`
**Features**:

- Display stage-specific content
- Video player for video lessons
- PDF viewer/download for documents
- Text content display
- Progress tracking per lesson
- Assessment access when all lessons complete

#### 3.3 Assessment Interface

**Location**: `/src/app/(public)/growth-track/[stage]/assessment/page.jsx`
**Features**:

- Timed assessment (optional)
- Multiple choice questions
- Auto-grading
- Certificate generation on pass
- Retry mechanism for failed attempts

### Phase 4: Progress Tracking & Notifications

#### 4.1 Member Progress API

**Location**: `/src/app/api/public/member-progress/route.js`
**Endpoints**:

- POST `/lesson-complete`: Mark lesson as viewed
- POST `/assessment-submit`: Submit and grade assessment
- GET `/certificate/:memberId/:stageId`: Generate certificate

#### 4.2 Progress Tracking Component

**Location**: `/src/components/growth/ProgressTracker.jsx`
**Features**:

- Visual progress bar
- Badges for completed stages
- Certificate download links
- Next steps guidance

### Phase 5: Admin Member Management

#### 5.1 Enhanced Member Management

**Location**: `/src/app/admin/(protected)/members/page.jsx`
**Features**:

- Complete member list with filtering
- Growth level overview
- Bulk actions: Assign to stage, Send notifications
- Member profile view with full history
- First timer conversion tracking

#### 5.2 Growth Track Analytics

**Location**: `/src/app/admin/(protected)/growth-analytics/page.jsx`
**Metrics**:

- Members per growth level
- Completion rates per stage
- Average time to complete stages
- Drop-off analysis
- Assessment pass rates

### Phase 6: Integration & Automation

#### 6.1 Automated Workflows

- Auto-enroll new members in FOUNDATIONAL_CLASS
- Email/SMS notifications for new content
- Reminder system for incomplete stages
- Certificate generation and storage

#### 6.2 Data Migration Considerations

- Handle existing members without growth tracking
- Bulk import capability for legacy data
- Manual level assignment for existing members

## Technical Implementation Details

### Database Relationships

```prisma
// Key relationships to maintain
FirstTimer -> Member (one-to-one via memberId)
Member -> MemberProgress (one-to-many)
MemberProgress -> GrowthStage (many-to-one)
Member -> Assembly (many-to-one)
```

### Security Considerations

1. Member lookup requires phone/email verification
2. Rate limiting on registration endpoints
3. CAPTCHA for public forms
4. Assembly-scoped admin access
5. Secure certificate generation

### API Response Standards

- Consistent error messages
- Proper HTTP status codes
- Validation feedback
- Success confirmations

### UI/UX Guidelines

1. Mobile-responsive design priority
2. Simple, intuitive navigation
3. Clear progress indicators
4. Encouraging messaging
5. Accessibility compliance

## Implementation Priority Order

1. **Week 1**: First Timer Registration
   - Registration form
   - API endpoint
   - Basic admin view

2. **Week 2**: Member Registration & Lookup
   - Smart registration flow
   - Lookup API
   - Member status endpoint

3. **Week 3**: Growth Track Portal
   - Member authentication
   - Content display
   - Lesson tracking

4. **Week 4**: Assessment & Progress
   - Assessment interface
   - Progress tracking
   - Certificate generation

5. **Week 5**: Admin Features
   - Member management
   - Analytics dashboard
   - Bulk operations

6. **Week 6**: Testing & Refinement
   - End-to-end testing
   - Performance optimization
   - User feedback incorporation

## Success Metrics

- First timer registration completion rate > 80%
- Member lookup success rate > 95%
- Growth track engagement rate > 60%
- Assessment pass rate > 70%
- Admin satisfaction score > 4/5

## Risk Mitigation

- **Data Loss**: Regular backups, soft deletes
- **Performance**: Pagination, caching, indexing
- **User Confusion**: Clear instructions, help tooltips
- **Technical Debt**: Clean code, documentation, tests

## Post-Launch Enhancements

1. Mobile app integration
2. Social features (study groups)
3. Gamification elements
4. Advanced analytics
5. Multi-language support

## Conclusion

This implementation will transform the growth track from an admin-only feature to a comprehensive member journey system, enabling effective tracking, engagement, and spiritual development of church members from their first visit through advanced leadership training.
