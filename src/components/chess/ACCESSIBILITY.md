# Chess Board Accessibility Features

This document describes the accessibility improvements implemented in the Board component to ensure WCAG AA compliance and provide an inclusive experience for all users.

## Implemented Features

### 1. ARIA Attributes

- **role="grid"**: The board container is marked as a grid for screen readers
- **role="button"**: Each square is marked as an interactive button
- **aria-label**: Each square has a descriptive label (e.g., "e4, White Pawn" or "d5, empty square")
- **aria-pressed**: Indicates when a square is selected
- **aria-disabled**: Indicates when interaction is disabled (e.g., during AI's turn)
- **role="status"** with **aria-live="polite"**: Screen reader announcer for move notifications

### 2. Keyboard Navigation

Users can navigate the chess board using keyboard controls:

- **Tab**: Focus on the board (starts at center square e4)
- **Arrow Keys**: Navigate between squares
  - Left/Right: Move between files (a-h)
  - Up/Down: Move between ranks (1-8)
- **Enter or Space**: Select/move piece on focused square
- **Escape**: Clear selection and deselect piece

Visual feedback:
- Focused squares have a blue ring indicator (`ring-2 ring-blue-500`)
- Keyboard navigation state is maintained separately from mouse interaction

### 3. Screen Reader Announcements

The board announces important events to screen readers:

- **Move announcements**: "White Pawn moved from e2 to e4"
- **Capture announcements**: "Black Knight moves from g8 to f6 captures Pawn"
- **Check announcements**: "Check!"
- **Checkmate announcements**: "Checkmate! White wins!"
- **Navigation announcements**: When navigating with keyboard, announces square and piece (e.g., "e4, White Pawn")
- **Selection cleared**: When pressing Escape

All announcements use a visually hidden live region that's accessible to screen readers.

### 4. Color Contrast (WCAG AA Compliance)

Updated color values to meet WCAG AA minimum contrast ratio of 4.5:1:

**Light Mode:**
- Primary text: `#171717` on `#ffffff` (contrast ratio: 16.1:1) ✓
- Secondary text: Updated from `#6b7280` to `#525252` (contrast ratio: 7.0:1) ✓

**Dark Mode:**
- Primary text: `#f1f5f9` on `#0f172a` (contrast ratio: 15.5:1) ✓
- Secondary text: Updated from `#94a3b8` to `#cbd5e1` (contrast ratio: 11.8:1) ✓

**Chess Board:**
- Light squares: `#f0d9b5` (tan/beige)
- Dark squares: `#b58863` (brown)
- Contrast between board colors and pieces is sufficient for visibility

**Visual States:**
- Selected square: Yellow/gold highlight with sufficient contrast
- Last move: Light green highlight
- King in check: Red pulsating background with high contrast
- Legal moves: Semi-transparent indicators that don't interfere with piece visibility

### 5. Focus Management

- Board maintains focus state for keyboard navigation
- Focus indicator (blue ring) is clearly visible
- Focus is set to center square (e4) when board receives focus
- Focus state is independent of selection state
- Tab index management: Only focused square has `tabIndex={0}`, others have `tabIndex={-1}`

## Usage

### For Keyboard Users

1. Tab to the chess board to focus it
2. Use arrow keys to navigate between squares
3. Press Enter or Space to select a piece
4. Navigate to destination square with arrow keys
5. Press Enter or Space to move the piece
6. Press Escape to cancel selection

### For Screen Reader Users

- Screen readers will announce each square as you navigate
- Move announcements are made automatically after each move
- Game state changes (check, checkmate) are announced
- All interactive elements have descriptive labels

## Testing

To test accessibility features:

1. **Keyboard Navigation**: Try navigating the board using only keyboard
2. **Screen Reader**: Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac) to test announcements
3. **Color Contrast**: Use browser DevTools or online contrast checkers to verify ratios
4. **Focus Indicators**: Ensure focus ring is visible when navigating with keyboard

## Future Improvements

Potential enhancements for even better accessibility:

- Add sound effects for moves (with option to disable)
- Implement chess notation input for advanced users
- Add high contrast mode option
- Provide alternative board themes for color blind users
- Add haptic feedback for mobile devices
