# AI Chat UI

A Next.js chat application with daisyUI Forest theme.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Backlog

### High Priority
- [ ] ChatInput - add support for send message by enter, shift enter to second line
- [ ] ChatArea - add max height so we dont have to scroll the whole page
- [ ] Implement Zustand for state management
- [ ] Build custom `useChat` hook with streaming support using mock server
- [ ] Create Route Handler for LLM API (`/api/chat`)

### Medium Priority
- [ ] ChatInput - add text validation, send button should disable when no input
- [ ] ChatInput - size should be adjustable, adding more line should change the height
- [ ] Wire up actual LLM API (OpenAI/Anthropic)
- [ ] Design to make it more job search focused


### Low Priority
- [ ] Refactor header
- [ ] Add SSE streaming support
- [ ] Add authentication
- [ ] Support adding multiple chat and save chat history
- [ ] Support uploading pictures

### UI design
- [ ] Redesign the theme
- [ ] Tokenize common patterns

## Update Log

### 2024-12-09
- Refactored state to use callback pattern, added loading state
- Added welcome screen and loading skeleton
- Glassmorphism + neon border styling for chat components

### Earlier
- Basic layout with Header, ChatArea, ChatInput
- daisyUI Forest theme integration
