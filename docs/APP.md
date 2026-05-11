# Kayseri Social Run — Product design, architecture, and roadmap

This document describes the **concept**, **user model**, **feature set**, **privacy and safety rules**, **platform modules**, and **MVP vs later releases** for this project.

The first concrete use case is the **Kayseri Runners Club**, but the product is framed as a **Social Club Operating System** so it can later support hiking, cycling, book clubs, student groups, gaming, photography, volunteering, and similar communities.

---

## Why this product

The idea starts from real pain: *Who is actually joining?* and *Where is the group right now?* Clear attendance and live coordination replace scattered WhatsApp or Instagram threads. Over time, the same patterns apply to **any** social club—not only runners.

---

## Table of contents

1. [Core concept](#1-core-concept)
2. [Main user types](#2-main-user-types)
3. [Core features](#3-core-features)
4. [Next-level features](#4-next-level-features)
5. [Privacy and safety design](#5-privacy-and-safety-design)
6. [Suggested app modules](#6-suggested-app-modules)
7. [MVP vs future versions](#7-mvp-vs-future-versions)
8. [Product differentiation](#8-product-differentiation)

---

## 1. Core concept

A platform for clubs to:

- Create and publish **activities**
- **Track attendance** and participation state
- Share **live coordination** during events
- Build **community** around events (media, announcements, light social layer)

**Positioning:** not “a website for one running club,” but a **live coordination and community platform for real-world social activities**.

---

## 2. Main user types

### Visitor

| Allowed | Not allowed |
| --- | --- |
| View public events | Join an event directly without registering |
| View club profile | See live group location |
| View public gallery | See private participant list |
| See approximate event area (not exact live tracking) | Message members |
| Request to join / register | — |

### Registered member

- Join and cancel participation in activities
- See upcoming calendar
- During events they joined: access **live group location** (per privacy rules)
- Upload photos after activities (where enabled)
- See participant lists when the club/event allows it
- Receive reminders and updates

### Coordinator / activity leader

- Create and edit events, including route/map details where supported
- **Start/stop** live tracking sessions
- Share live location (e.g. as avatar/mascot representation)
- Mark attendance and manage waitlists / approvals if configured
- Send updates to participants who joined

### Club admin

- Manage members and assign coordinators
- Moderate photos/posts and club settings
- View analytics
- Create recurring events

---

## 3. Core features

### 3.1 Activity / event publishing

Each activity should support (as applicable):

| Field | Examples / notes |
| --- | --- |
| Title | e.g. “Thursday Easy Run” |
| Type | Run, walk, hike, social meetup, training, race prep, etc. |
| Date and time | — |
| Meeting point | Address or map pin |
| Map route | Optional in MVP; richer in later versions |
| Distance | e.g. 5 km |
| Pace level | e.g. ~7:30/km |
| Difficulty | Beginner-friendly, etc. |
| Required items | Water, visibility gear, etc. |
| Max participants / waitlist | Optional |
| Coordinator | Named leader |
| Visibility | Public / private / members-only |
| Join deadline | — |
| Weather / conditions | Warnings or info |
| Notes | Free text |

**Example:** Thursday easy run — 5 km, beginner-friendly, ~7:30 pace, meeting at Talas Park, coordinator: Sara.

### 3.2 Participation tracking (MVP centerpiece)

Members can set state such as:

- Going / Maybe / Not going
- Cancel participation

Coordinators see:

- Confirmed participants and waitlist
- Last-minute cancellations and new join requests
- Attendance check-in (manual or via QR in later versions)

**Useful participant labels** (for ops and inclusion):

- First timer
- Needs help finding the group
- Coming late
- Bringing a friend
- Emergency contact on file

This directly reduces chaos in group chats.

### 3.3 Live group location (“wow” feature)

During an active session:

- Coordinator starts a **live session** for the activity
- Members who **joined that activity** see group location
- Location can be shown as avatar/mascot/animated marker (not only a raw pin)
- Late joiners can navigate toward the group
- Live tracking **automatically ends** when the activity ends (or coordinator stops it)

**Privacy (non-negotiable):** only people who **joined that specific activity** see live location—not visitors, not non-participants.

**UX cues:**

- “Group is moving”
- “Last updated … ago”
- “Navigate to group”
- Quick access to coordinator contact

### 3.4 Calendar

- Weekly, monthly, and list views
- Filters: type, pace, difficulty, location
- Export / add to Google Calendar or Apple Calendar
- Recurring events (especially important for weekly runs)

### 3.5 Media gallery / social feed

After events, members upload photos tied to the activity.

**Structure options:**

- Per-event albums
- Public vs member-only galleries
- Featured photos
- Comments and reactions
- Optional coordinator approval before public visibility

Compared to random stories, media stays **organized by event**.

---

## 4. Next-level features

### Smart event matching

Recommend events using level, preferred distance/pace, favorite locations, availability, and past attendance.

**Example:** “This Saturday’s 5K social run matches your usual pace.”

### Route preview

For run/hike/cycle clubs: map route, distance, elevation, estimated duration, start/end, water stops, emergency points.

### Safety layer

- Emergency contact on profile (restricted visibility)
- SOS or urgent help flow
- Share location with coordinator (explicit, time-bounded)
- Check-in / check-out for events
- “I arrived home safely”
- Incident reporting
- Coordinator view: who has not checked out

### Late join mode

For the “I’m running late” case:

- Current group location and navigation
- Estimated catch-up context where feasible
- “I’m on my way” signal to coordinators
- Coordinator sees who is joining late

### Attendance history and gamification (light)

Members see events attended, distances, streaks, badges, favorite routes.

**Runner-oriented examples:** total club kilometers, participation streak, “first 5K with the club,” “10 events attended.”

### Club challenges

Examples: monthly distance challenge, “four runs this month,” beginner 5K, team leaderboard, route completion badges.

### Announcements

Structured updates instead of chat noise: cancellations, location changes, new route, timed reminders (e.g. two hours before).

### QR check-in

Coordinator shows a QR at the meeting point; members scan to confirm attendance—useful for records, rewards, safety, and analytics.

### Member profiles

Useful but not “full social network”: name, avatar, level, preferred pace, short bio, public badges/history, **emergency info visible only to coordinators**.

### Club spaces (multi-tenant direction)

One app hosts many clubs (e.g. Kayseri Runners, hiking club, student club, cycling). Each club has its own members, events, media, coordinators, and settings.

---

## 5. Privacy and safety design

Live location must **never** be public in the sense of “anyone on the internet.”

| Rule | Detail |
| --- | --- |
| Visitors | No live tracking |
| Live visibility | Only registered members who **joined the event** |
| Retention | Live location expires when the event ends (or session stops) |
| Control | Coordinator starts/stops live session |
| Transparency | Users always know when tracking is active |
| Lists | Exact participant list can be hidden on public events |
| Sensitive data | Emergency contacts and similar fields are restricted |

This matters especially for women’s safety and for public-facing events.

---

## 6. Suggested app modules

Logical boundaries for implementation and ownership:

1. **Club management** — clubs, members, roles, settings  
2. **Events** — create, publish, join, cancel, waitlist, recurrence  
3. **Maps and live sessions** — meeting points, routes, live coordinator tracking, late join  
4. **Calendar** — listings, filters, reminders  
5. **Community** — gallery, posts, comments, reactions  
6. **Safety** — emergency contacts, check-in/out, SOS, incidents  
7. **Notifications** — push, email; optional WhatsApp/Telegram later  
8. **Analytics** — attendance, routes, growth, active members  

---

## 7. MVP vs future versions

### MVP (build first)

- User registration and login  
- Club page  
- Event creation  
- Join / cancel participation  
- Participant list for coordinators  
- Calendar or list of upcoming events  
- Map meeting point  
- Basic live coordinator location (with strict join-based access)  
- Public gallery (simple)  

### Version 2

- Full route maps  
- Late join mode  
- QR attendance  
- Notifications  
- Richer member profiles  
- Per-event albums  

### Version 3

- Challenges and badges  
- Smart recommendations  
- Multi-club (“spaces”) support  
- Safety dashboard  
- Strong mobile / PWA experience  
- Integrations: Strava, Garmin, Google Calendar, etc.  

---

## 8. Product differentiation

The product should feel like **live coordination plus community around real-world activities**, not a static club brochure.

**Strongest differentiated capabilities:**

1. **Structured join tracking** instead of messy DMs  
2. **Avatar-style live group location** for people who actually joined  
3. **Late join navigation** and coordinator signals  
4. **Event-based gallery** instead of lost stories  
5. **Safety check-in/out** and coordinator visibility  
6. **Reusable architecture** for many club types under one platform  

---

*This document is the working product vision for the repository; implementation details and API design should stay aligned with it as the codebase grows.*
