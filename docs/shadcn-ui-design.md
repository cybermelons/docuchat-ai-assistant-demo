# Shadcn UI Redesign Plan

## Current Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         Header                              │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│                     │                                       │
│    Sidebar          │         Chat Area                     │
│  - File Upload      │       - Messages                      │
│  - Document List    │       - Input Box                     │
│                     │                                       │
│                     │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

## New Shadcn Design

```
┌─────────────────────────────────────────────────────────────┐
│  AI Document Assistant            [Theme Toggle] [Settings] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │   Documents     │ │   Chat                              │ │
│ ├─────────────────┤ ├─────────────────────────────────────┤ │
│ │ [Upload Button] │ │ ┌─────────────────────────────────┐ │ │
│ │                 │ │ │                                 │ │ │
│ │ ┌─────────────┐ │ │ │   Welcome! Upload documents     │ │ │
│ │ │ 📄 file1.pdf│ │ │ │   and start asking questions.   │ │ │
│ │ │ 2.3 MB      │ │ │ │                                 │ │ │
│ │ │ [Delete]    │ │ │ └─────────────────────────────────┘ │ │
│ │ └─────────────┘ │ │                                     │ │
│ │                 │ │ ┌─────────────────────────────────┐ │ │
│ │ ┌─────────────┐ │ │ │ User: What is...?               │ │ │
│ │ │ 📄 file2.txt│ │ │ └─────────────────────────────────┘ │ │
│ │ │ 45 KB       │ │ │                                     │ │
│ │ │ [Delete]    │ │ │ ┌─────────────────────────────────┐ │ │
│ │ └─────────────┘ │ │ │ AI: Based on your documents...  │ │ │
│ │                 │ │ └─────────────────────────────────┘ │ │
│ │                 │ │                                     │ │
│ │                 │ ├─────────────────────────────────────┤ │
│ │                 │ │ [Input field...          ] [Send] │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Layout Structure
- **App Shell**: Main container with header and content areas
- **Header**: Logo, theme toggle, settings button
- **Content Grid**: Responsive grid with sidebar and main area

### 2. Shadcn Components to Use

#### Navigation & Layout
- `Sheet` - Mobile sidebar drawer
- `Separator` - Visual dividers
- `ScrollArea` - Scrollable containers

#### Documents Panel
- `Card` - Document items
- `Button` - Upload, delete actions
- `Dialog` - Upload confirmation
- `Progress` - Upload progress
- `Badge` - File type/size indicators
- `DropdownMenu` - Document actions

#### Chat Interface
- `Card` - Message containers
- `Avatar` - User/AI avatars
- `Input` - Message input
- `Button` - Send button
- `Skeleton` - Loading states
- `Alert` - Error messages

#### Global Features
- `Toaster` - Notifications
- `ThemeProvider` - Dark/light mode
- `Tooltip` - Help text

### 3. Color Scheme
- Use shadcn's default theme variables
- Accent color for primary actions
- Muted backgrounds for sections
- High contrast for readability

### 4. Responsive Design
```
Mobile (<768px):
┌─────────────────┐
│ Header [Menu]   │
├─────────────────┤
│                 │
│   Chat Area     │
│                 │
├─────────────────┤
│ [Input] [Send]  │
└─────────────────┘

Sidebar as Sheet overlay
```

### 5. Interaction Patterns
- Drag & drop file upload
- Click to select documents
- Keyboard shortcuts (Cmd+K for search)
- Smooth transitions
- Loading skeletons
- Toast notifications

## Implementation Steps

1. **Install Shadcn UI**
   - Initialize shadcn
   - Add required components
   - Set up theme provider

2. **Create Layout Components**
   - AppShell.tsx
   - Header.tsx
   - DocumentsPanel.tsx
   - ChatPanel.tsx

3. **Replace Current Components**
   - Migrate Sidebar → DocumentsPanel
   - Migrate ChatArea → ChatPanel
   - Add proper spacing and styling

4. **Add Polish**
   - Loading states
   - Error boundaries
   - Animations
   - Mobile responsiveness

## Benefits of Shadcn Redesign
- Consistent, professional design system
- Built-in accessibility
- Dark mode support
- Better mobile experience
- Reusable component library
- Modern, clean aesthetic