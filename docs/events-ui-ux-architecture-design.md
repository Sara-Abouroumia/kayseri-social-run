# Events UI/UX and Architecture Design

## 1. Purpose

The events module should not behave like a simple static event listing. It should act as a flexible event operating system for real-world social clubs.

The first use case is Kayseri Social Run, but the design should support different activity types such as runs, hikes, walks, social gatherings, barbecues, cycling events, workshops, and other club activities.

The main goals are:

- Let admins create customizable events.
- Let participants register with event-specific information.
- Support subgroups within one event.
- Support free and paid events.
- Support automatic or manual approval workflows.
- Give admins a practical dashboard to review, filter, sort, accept, reject, and manage participants.
- Keep the design flexible enough for future club types without overcomplicating the MVP.

---

## 2. Core Event Concept

Each event has a type. The event type controls the default fields, registration behavior, and optional custom questions.

Example event types:

| Emoji | Type | Example use |
| --- | --- | --- |
| 🏃 | Run | Weekly group run, pace groups, distance groups |
| 🥾 | Hike | Hiking route, transport planning, vehicle capacity |
| 🚶 | Walk | Casual walk, beginner activity |
| ☕ | Social | Coffee meetup, dinner, casual gathering |
| 🔥 | Barbecue | Food planning, contribution list, paid/free setup |
| 🚴 | Cycling | Distance, speed group, route planning |
| 🏋️ | Training | Workout session, capacity, skill level |

The event type should be selected at the start of event creation. Based on that type, the form shows only the relevant fields.

---

## 3. Event Creation UX Flow

### Step 1: Basic Information

Fields:

- Event title
- Event type
- Event image or cover
- Date and start time
- End time or estimated duration
- Location name
- Location address
- Map pin
- Description
- Visibility
  - Public
  - Members only
  - Private link

### Step 2: Type-Specific Details

Fields change depending on event type.

#### Run

Possible fields:

- Distance
- Pace
- Difficulty
- Route map
- Meeting point
- Warm-up notes
- Subgroups enabled or disabled

#### Hike

Possible fields:

- Distance
- Difficulty
- Elevation
- Estimated duration
- Required equipment
- Transport planning enabled or disabled
- Vehicle contribution questions

#### Social Gathering

Possible fields:

- Venue
- Dress code or theme
- Reservation details
- Capacity
- Notes

#### Barbecue

Possible fields:

- Food contribution
- Equipment needs
- Cost per person
- Bring-your-own option
- Capacity

---

## 4. Event Groups / Subgroups

Some events need multiple groups inside the same event.

Example:

Event: Thursday Social Run

| Group | Distance | Pace | Difficulty | Capacity |
| --- | --- | --- | --- | --- |
| Easy 5K | 5 km | 7:00/km | Beginner | 25 |
| Chill 4K | 4 km | 8:00/km | Beginner | 20 |
| Strong 10K | 10 km | 6:00/km | Intermediate | 15 |

Participants can select a group while registering.

Recommended group fields:

- Group name
- Distance
- Pace label
- Difficulty
- Capacity
- Coordinator
- Notes

Groups should be optional. A simple event may have no groups.

---

## 5. Event Cost Model

Events can be free or paid.

### Cost options

- Free
- Paid manually
- Paid online later

For MVP, avoid payment integration and support manual payment notes.

Fields:

- `isPaid`
- `price`
- `currency`
- `paymentInstructions`
- `paymentRequiredBeforeAcceptance`

Example:

```txt
Fee: 100 TL
Payment method: IBAN or cash to coordinator
```

Later, online payments can be added with Stripe, Iyzico, or another provider.

---

## 6. Registration Workflow

The registration workflow should support different statuses.

Recommended statuses:

| Status | Meaning |
| --- | --- |
| Pending | User registered but needs admin approval |
| Accepted | User is approved to attend |
| Rejected | User was not accepted |
| Cancelled | User cancelled their own registration |
| Waitlisted | User is waiting for available capacity |
| Checked in | User attended and checked in |

Simple events can auto-accept participants.

Complex events can require approval.

---

## 7. Custom Registration Questions

Each event can define custom questions for participants.

Question types:

- Text
- Number
- Yes / No
- Single choice
- Multi choice
- Phone
- Date

Examples:

- Are you coming with your own car?
- How many seats can you offer?
- Do you need transportation?
- Can you bring food?
- What is your running level?
- Do you have any medical note the coordinator should know?
- Are you bringing a friend?

These answers should be visible to admins and coordinators in the participant management table.

---

## 8. Conditional Approval Rules

Some events need logic that changes the registration status based on answers.

### Example: Hike with vehicle logistics

Question:

```txt
Are you coming with your own car?
```

If answer is yes:

```txt
status = accepted
```

If answer is no:

```txt
status = pending
```

Reason:

Participants with cars increase capacity. Participants without cars depend on available seats.

### MVP approach

For the first implementation, keep rules simple and hardcoded per event type where needed.

Example:

- Run: auto-accept by default
- Social: auto-accept until capacity is full
- Hike: pending approval if user needs transport

### Future approach

Later, build a rule builder:

```txt
IF answer.car = yes THEN accepted
IF answer.needsRide = yes THEN pending
IF event.capacity reached THEN waitlisted
```

---

## 9. Admin Participant Management UX

Admins need a practical table to manage registrations.

### Table columns

- Participant name
- Email
- Registration status
- Selected group
- Applied at
- Car status
- Seats offered
- Needs ride
- Payment status
- Notes
- Actions

### Filters

- Status
  - Pending
  - Accepted
  - Rejected
  - Waitlisted
  - Cancelled
- Group
- Car available: yes / no
- Needs ride: yes / no
- Payment status
- Applied date

### Sorting

- Applied first to latest
- Applied latest to first
- Name A-Z
- Group
- Status

### Actions

- Accept
- Reject
- Move to waitlist
- Cancel participant
- Change selected group
- Send email
- Export CSV

---

## 10. Email Notifications

Email should be sent for important registration changes.

Recommended emails:

- Registration received
- Registration accepted
- Registration rejected
- Moved to waitlist
- Event updated
- Event cancelled
- Reminder before event

Example acceptance email:

```txt
Subject: You are accepted for Saturday Hike

Hi Sara,

Your registration for Saturday Hike has been accepted.

Meeting point: Talas Park
Time: 08:00

See you there!
Kayseri Social Run
```

The app should use the existing transactional email service, such as Resend.

---

## 11. Public Event Page UX

The public event page should show:

- Event title
- Event type with emoji
- Date and time
- Location
- Event image
- Description
- Difficulty
- Distance or pace if relevant
- Cost if relevant
- Available groups if relevant
- Registration button
- Capacity status
- Organizer or coordinator

For visitors:

- They can view public details.
- They must register or log in before joining.

For members:

- They can register.
- They can cancel.
- They can see their registration status.

---

## 12. Participant Registration UX

When a user clicks Join:

### If event has groups

User selects a group.

### If event has custom questions

User answers the event questions.

### If event has cost

User sees payment instructions.

### After submission

The UI shows one of:

- You are accepted.
- Your registration is pending approval.
- You are on the waitlist.

---

## 13. Suggested Database Model

Recommended MVP-flexible model:

```txt
events
event_groups
event_questions
event_participants
event_answers
```

Optional future tables:

```txt
event_payments
event_notifications
event_checkins
event_rules
```

### events

Stores the main event.

Suggested fields:

- id
- title
- description
- eventType
- startsAt
- endsAt
- locationName
- locationAddress
- latitude
- longitude
- visibility
- isPaid
- price
- currency
- paymentInstructions
- registrationMode
- capacity
- createdByUserId
- createdAt
- updatedAt

### event_groups

Stores subgroups inside an event.

Suggested fields:

- id
- eventId
- name
- distanceKm
- paceLabel
- difficulty
- capacity
- coordinatorName
- notes
- createdAt
- updatedAt

### event_questions

Stores custom registration questions.

Suggested fields:

- id
- eventId
- label
- questionType
- required
- options
- sortOrder
- createdAt

### event_participants

Stores registration records.

Suggested fields:

- id
- eventId
- userId
- eventGroupId
- status
- appliedAt
- acceptedAt
- rejectedAt
- cancelledAt
- note
- createdAt
- updatedAt

### event_answers

Stores answers to custom questions.

Suggested fields:

- id
- eventParticipantId
- eventQuestionId
- value
- createdAt

---

## 14. TypeScript Event Type Configuration

For MVP, event types can be hardcoded in TypeScript before moving them to the database.

Example:

```ts
export const EVENT_TYPES = [
  {
    id: "run",
    label: "Run",
    emoji: "🏃",
    fields: ["distance", "pace", "route", "groups"],
    defaultRegistrationMode: "auto_accept",
  },
  {
    id: "hike",
    label: "Hike",
    emoji: "🥾",
    fields: ["distance", "difficulty", "elevation", "vehicleLogistics"],
    defaultRegistrationMode: "conditional_approval",
  },
  {
    id: "social",
    label: "Social",
    emoji: "☕",
    fields: ["venue", "capacity"],
    defaultRegistrationMode: "auto_accept",
  },
  {
    id: "barbecue",
    label: "Barbecue",
    emoji: "🔥",
    fields: ["foodContribution", "cost", "capacity"],
    defaultRegistrationMode: "manual_approval",
  },
];
```

This keeps the first implementation simple while preserving future flexibility.

---

## 15. MVP Implementation Scope

Build first:

1. Event type selector with emoji
2. Type-specific form sections
3. Event groups
4. Free or paid event settings
5. Custom registration questions
6. Participant status system
7. Admin participant table with filters and sorting
8. Accept / reject / waitlist actions
9. Acceptance and rejection emails

Do not build first:

- Full payment gateway
- Fully dynamic rule builder
- Advanced transport matching
- AI event recommendations
- Complex multi-club customization

---

## 16. Future Enhancements

Possible later features:

- Visual rule builder for conditional approvals
- Payment integration
- QR check-in
- Transport seat matching
- Live location for accepted participants
- Event-specific group chat
- Calendar export
- Admin analytics
- Multi-language event content
- AI-assisted translation for event descriptions
- AI-assisted event creation templates

---

## 17. Product Positioning

This event system should be described as:

```txt
Flexible Registration Workflows for Real-World Social Activities
```

or:

```txt
A configurable event coordination system for clubs and communities
```

The value is not only creating events. The value is managing the messy operational details around attendance, approval, transport, subgroups, communication, and participation status.

---

## 18. Engineering Principle

The design should stay flexible without over-engineering the first release.

Recommended approach:

```txt
Hardcode event type behavior first.
Store flexible event questions and participant answers in the database.
Add rule-builder automation later only when real usage proves the need.
```

This gives the app a strong MVP while still supporting future product expansion.
