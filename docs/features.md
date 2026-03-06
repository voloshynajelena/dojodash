# DojoDash Features

## Overview

DojoDash is a kids sports club management platform with three user roles:
- **Admin** - Platform administrators
- **Coach** - Club owners and instructors
- **Family** - Parents managing their children

---

## Global Features

### Theme Switcher
- Sun/moon toggle button in header
- Switches between light and dark mode
- Preference persisted in browser

### Notifications
- Real-time notification bell with unread count
- Notification types: session reminders, medals, attendance, group changes
- Mark as read functionality

### Scroll-to-Top
- Floating button appears when scrolled down
- Available on all pages

---

## Admin Features

### Dashboard (`/app/admin`)
- System overview statistics
- Quick access to management pages

### Club Management (`/app/admin/clubs`)
- View all clubs in system
- Create new clubs
- Edit club settings
- Assign coaches to clubs

### Coach Management (`/app/admin/coaches`)
- Create coach accounts with custom claims
- Assign coaches to multiple clubs
- Enable/disable coach accounts

### User Management (`/app/admin/users`)
- View all users (families, children)
- Search and filter users
- Disable problematic accounts

### Audit Logs (`/app/admin/logs`)
- Global audit trail
- Filter by action type, user, date
- Track all system changes

---

## Coach Features

### Dashboard (`/app/coach`)
- **Stats Widgets**: Total Members, Groups (clickable)
- **Today's Sessions**: Quick attendance access
- **Recent Awards**: Latest medals given
- **Quick Actions**: Links to common tasks

### Club Settings (`/app/coach/club`)
- **Logo Upload**: Upload club logo to Firebase Storage
- **Club Details**: Edit name, slug, color, timezone
- **XP Settings**: Configure XP per session and streak bonus

### Groups (`/app/coach/groups`)
- **List View**: All groups with member counts
- **Create Group**: Name, description, color picker
- **Manage Group**:
  - Edit group settings
  - View/add/edit/remove members
  - Move members between groups
- **Invite System**: Generate invite codes/links

### Members (`/app/coach/members`)
- View all members across all groups
- Search by name, email, Instagram
- Filter by group
- Contact information display

### Schedule (`/app/coach/schedule`)
- **Calendar View**: Sessions by date
- **List View**: All sessions with filters
- **Create Session**: Title, group, date, time, recurrence
- **Edit Session**: Modify details
- **Cancel Session**: With notification to families

### Rewards (`/app/coach/rewards`)
- **Medal Templates**: Create custom rewards
  - Name, description, XP value
  - Color, shape, border style
  - Championship medals (transferable)
- **Award Medals**: Give to children during attendance
- **View History**: Recent awards

### Notifications (`/app/coach/notifications`)
- New member joined alerts
- Member removed alerts
- System notifications

---

## Family Features

### Children (`/app/family`)
- **Child List**: All registered children
- **Add Child**: First name, last name, birthday
- **Child Details** (tabs per child):
  - **Overview**: Basic info, edit/remove
  - **Stats**: XP, level, streak, attendance rate
  - **Medals**: Earned medals with details

### Schedule (`/app/family/schedule`)
- View upcoming sessions for all children
- Session details: time, group, location
- Calendar view of activities

### Notifications (`/app/family/notifications`)
- Session scheduled/cancelled alerts
- Attendance marked notifications
- Medal awarded celebrations
- Level up announcements
- Group changes (joined/left)

### Settings (via user menu)
- Display name
- Email
- Password change
- Notification preferences

---

## Notification Types

| Type | Recipient | Trigger |
|------|-----------|---------|
| `session_scheduled` | Family | New session created |
| `session_cancelled` | Family | Session cancelled |
| `attendance_marked` | Family | Child attendance recorded |
| `medal_awarded` | Family | Child receives medal |
| `level_up` | Family | Child reaches new level |
| `group_joined` | Family | Child added to group |
| `group_left` | Family | Child removed from group |
| `member_joined` | Coach | New member in their club |
| `member_left` | Coach | Member leaves their club |

---

## XP & Gamification

### XP Sources
- Session attendance: Configurable per club (default: 10 XP)
- Streak bonus: Extra XP for consecutive attendance (default: 5 XP)
- Medals: Each medal has custom XP value

### Levels
- 100 XP per level
- Max level: 100
- Progress bar shows XP to next level

### Streaks
- Count consecutive attended sessions
- Broken by missed session
- Longest streak tracked

---

## Security Features

### Role-Based Access
- Custom claims in Firebase Auth
- Route guards on all pages
- API-level permission checks

### Data Privacy
- Children data scoped to parent
- Coach access limited to their clubs
- Leaderboard visibility controls

### App Check
- Firebase App Check integration
- Prevents unauthorized API access
