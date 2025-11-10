# SPICE Learning System Setup Guide

## Overview
The Learning System is a comprehensive educational platform integrated into the SPICE dating app. Users can complete learning modules, take quizzes, earn badges, and track their progress through various learning paths.

## Features

### 1. **Learning Modules**
- Educational content organized into structured lessons
- Three main learning paths:
  - Communication Fundamentals (6 modules)
  - Safety & Privacy (5 modules)
  - Relationship Dynamics (4 modules)

### 2. **Interactive Quizzes**
- 3 questions per module
- Multiple choice format
- Immediate feedback with explanations
- 70% passing score required
- Unlimited retakes allowed

### 3. **Progress Tracking**
- Real-time progress bars for each module and path
- Status indicators: Not Started, In Progress, Completed
- Quiz scores and attempt tracking
- Sequential unlocking (complete previous module to unlock next)

### 4. **Badge System**
- Automatic badge awards on path completion
- Visual badge display with earned dates
- Three unique badges, one for each learning path

## Installation Steps

### Step 1: Database Setup

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `LEARNING_SYSTEM_SCHEMA.sql`
4. Paste and run in the SQL Editor
5. Verify tables are created:
   - `learning_modules`
   - `user_module_progress`
   - `learning_path_badges`

### Step 2: Verify Database Tables

Run this query to verify setup:

```sql
SELECT 
    (SELECT COUNT(*) FROM learning_modules) as modules_count,
    (SELECT COUNT(*) FROM user_module_progress) as progress_count,
    (SELECT COUNT(*) FROM learning_path_badges) as badges_count;
```

Expected result:
- modules_count: 15
- progress_count: 0 (will increase as users progress)
- badges_count: 0 (will increase as users earn badges)

### Step 3: Test RLS Policies

Ensure Row Level Security is working:

```sql
-- Test as authenticated user
SELECT * FROM learning_modules WHERE is_active = true;
-- Should return all 15 modules

-- Test user progress (requires actual user ID)
SELECT * FROM user_module_progress WHERE user_id = auth.uid();
-- Should return only current user's progress
```

## Component Architecture

### Frontend Components

1. **LearningJourney.tsx** (`/app/src/pages/LearningJourney.tsx`)
   - Main page displaying all learning paths
   - Progress overview and statistics
   - Badge display section

2. **ModuleContent.tsx** (`/app/src/components/ModuleContent.tsx`)
   - Modal displaying educational content
   - Structured lessons with headings and paragraphs
   - Complete button to proceed to quiz

3. **ModuleQuiz.tsx** (`/app/src/components/ModuleQuiz.tsx`)
   - Interactive quiz component
   - Multiple choice questions with visual feedback
   - Score calculation and pass/fail handling

4. **PathBadge.tsx** (`/app/src/components/PathBadge.tsx`)
   - Visual badge representation
   - Earned/locked states
   - Hover tooltips with earned dates

### Backend Services

**learningService.ts** (`/app/src/services/learningService.ts`)
- API wrapper for all learning-related database operations
- Methods:
  - `getUserModuleProgress()` - Get progress for specific module
  - `getAllUserProgress()` - Get all user's progress
  - `startModule()` - Mark module as in-progress
  - `updateModuleProgress()` - Update progress percentage
  - `completeModule()` - Mark module completed with quiz score
  - `getUserBadges()` - Get user's earned badges
  - `awardPathBadge()` - Award path completion badge
  - `checkPathCompletion()` - Verify if path is complete

## Database Schema Details

### Tables

#### learning_modules
Stores the catalog of available learning modules
```sql
- id (TEXT, PK) - Unique module identifier
- path_id (TEXT) - Learning path identifier
- path_title (TEXT) - Path display name
- title (TEXT) - Module title
- description (TEXT) - Module description
- duration (TEXT) - Estimated completion time
- category (TEXT) - Module category
- sequence_order (INTEGER) - Order within path
- is_active (BOOLEAN) - Module availability
```

#### user_module_progress
Tracks individual user progress
```sql
- id (UUID, PK) - Progress record ID
- user_id (UUID, FK) - User reference
- module_id (TEXT, FK) - Module reference
- status (TEXT) - not-started, in-progress, completed
- progress_percentage (INTEGER) - 0-100
- quiz_score (INTEGER) - Quiz result
- quiz_attempts (INTEGER) - Number of attempts
- completed_at (TIMESTAMPTZ) - Completion timestamp
```

#### learning_path_badges
Stores earned badges
```sql
- id (UUID, PK) - Badge record ID
- user_id (UUID, FK) - User reference
- path_id (TEXT) - Path identifier
- path_title (TEXT) - Path name
- earned_at (TIMESTAMPTZ) - Award timestamp
```

### Automatic Triggers

1. **update_updated_at_column()**
   - Automatically updates `updated_at` timestamp on record changes

2. **set_module_completed_at()**
   - Sets `completed_at` when status changes to 'completed'

3. **check_and_award_path_badge()**
   - Automatically awards badge when all path modules are completed
   - Checks completion and prevents duplicate badges

## User Flow

### Starting a Module
1. User clicks on first module (or unlocked module)
2. Module marked as 'in-progress' in database
3. Educational content displayed in modal
4. User reads through all sections

### Completing a Module
1. User clicks "Complete Module & Take Quiz"
2. Quiz modal opens with 3 questions
3. User selects answers and receives immediate feedback
4. Score calculated automatically
5. If passed (70%+):
   - Module marked as 'completed'
   - Next module unlocked
   - Check for path completion
   - Award badge if path complete
6. If failed:
   - Option to retake quiz
   - Option to review module content

### Earning a Badge
1. User completes final module in a path
2. Trigger checks if all modules are completed
3. Badge automatically inserted into database
4. Badge appears in achievement section
5. User notified of achievement

## Testing the System

### Manual Test Flow

1. **Start First Module**
   ```
   - Navigate to /learning-journey
   - Click on "Introduction to Lifestyle Communication"
   - Read through content
   - Click "Complete Module & Take Quiz"
   ```

2. **Take Quiz**
   ```
   - Answer all 3 questions
   - Review explanations
   - Verify score calculation
   - Check pass/fail logic
   ```

3. **Complete Path**
   ```
   - Complete all 6 modules in Communication Fundamentals
   - Verify badge is awarded
   - Check badge appears in achievements section
   ```

### Database Verification Queries

**Check user progress:**
```sql
SELECT 
    u.email,
    ump.module_id,
    ump.status,
    ump.progress_percentage,
    ump.quiz_score
FROM user_module_progress ump
JOIN auth.users u ON u.id = ump.user_id
WHERE u.email = 'test@example.com'
ORDER BY ump.created_at;
```

**Check awarded badges:**
```sql
SELECT 
    u.email,
    lpb.path_title,
    lpb.earned_at
FROM learning_path_badges lpb
JOIN auth.users u ON u.id = lpb.user_id
WHERE u.email = 'test@example.com';
```

**View progress summary:**
```sql
SELECT * FROM user_path_progress_summary 
WHERE user_id = '<user-uuid>';
```

## Extending the System

### Adding New Modules

1. Insert into `learning_modules` table:
```sql
INSERT INTO learning_modules (id, path_id, path_title, title, description, duration, category, sequence_order)
VALUES ('mod-16', 'path-4', 'New Path', 'New Module', 'Description', '20 min', 'Category', 1);
```

2. Add content to `ModuleContent.tsx`:
```typescript
const content: Record<string, { sections: Array<{ heading: string; content: string }> }> = {
  'mod-16': {
    sections: [
      { heading: 'Title', content: 'Content here' }
    ]
  }
};
```

3. Add quiz questions to `ModuleQuiz.tsx`:
```typescript
const quizzes: Record<string, QuizQuestion[]> = {
  'mod-16': [
    {
      question: 'Question text?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Explanation here'
    }
  ]
};
```

### Adding New Learning Paths

1. Insert modules for new path
2. Add to `learningPaths` array in `LearningJourney.tsx`
3. Add badge design in `PathBadge.tsx`

## Troubleshooting

### Issue: Modules not unlocking
**Solution:** Check if previous module is marked as 'completed' in database

### Issue: Badge not awarded
**Solution:** Verify trigger is enabled and all modules in path are completed

### Issue: Progress not saving
**Solution:** 
- Check RLS policies are enabled
- Verify user authentication
- Check Supabase connection

### Issue: Quiz not showing
**Solution:** Ensure module ID exists in quiz questions mapping

## API Reference

### learningService Methods

```typescript
// Get module progress
await learningService.getUserModuleProgress(userId, moduleId);

// Start a module
await learningService.startModule(userId, moduleId);

// Complete module with score
await learningService.completeModule(userId, moduleId, score);

// Get all user progress
await learningService.getAllUserProgress(userId);

// Get user badges
await learningService.getUserBadges(userId);

// Award badge manually (usually automatic)
await learningService.awardPathBadge(userId, pathId, pathTitle);

// Check path completion
await learningService.checkPathCompletion(userId, pathId, moduleIds);
```

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **User Isolation**: Users can only access their own progress and badges
3. **Read-Only Modules**: Module catalog is read-only for users
4. **Trigger Security**: Badge awarding uses SECURITY DEFINER to ensure proper execution

## Performance Optimization

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Caching**: Frontend caches user progress to minimize database calls
3. **Batch Loading**: Progress and badges loaded together on page mount
4. **Optimistic Updates**: UI updates immediately, syncs with database in background

## Future Enhancements

- [ ] Certificate generation on path completion
- [ ] Leaderboard for fastest completions
- [ ] Timed quizzes with countdown
- [ ] Video content integration
- [ ] Discussion forums per module
- [ ] Admin panel for content management
- [ ] Analytics dashboard for learning metrics

## Support

For issues or questions:
1. Check database logs in Supabase dashboard
2. Review browser console for frontend errors
3. Verify RLS policies are properly configured
4. Test with SQL queries directly in Supabase

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained By:** SPICE Development Team
