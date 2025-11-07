# Implementation Plan

- [x] 1. Create difficulty validation utility





  - Create `src/lib/validation/difficulty-validator.ts` with validation and normalization functions
  - Implement `isValid()`, `normalize()`, `getDisplayName()`, and `getEloRange()` methods
  - Export utility from `src/lib/validation/index.ts`
  - _Requirements: 4.2, 4.5_

- [x] 2. Add comprehensive logging to track difficulty flow






  - [x] 2.1 Add logging to Lobby page

    - Add log when difficulty is selected in `src/app/lobby/page.tsx`
    - Add log when game is started with final settings
    - _Requirements: 2.1_

  - [x] 2.2 Add logging to Game page


    - Add log when reading URL params in `src/app/game/[id]/page.tsx`
    - Add log when creating GameSettings object
    - Add log when game is created with settings
    - _Requirements: 2.1, 4.1_

  - [x] 2.3 Add logging to useChessGame hook


    - Add log in `createGame()` method in `src/hooks/useChessGame.ts`
    - Log the difficulty from settings when storing game
    - _Requirements: 2.1_

  - [x] 2.4 Add logging to useChessAI hook


    - Add log when `requestAIMove()` is called in `src/hooks/useChessAI.ts`
    - Log difficulty parameter and validation result
    - _Requirements: 2.2, 4.3_

  - [x] 2.5 Add logging to AI API endpoint


    - Add log when request is received in `src/app/api/ai/move/route.ts`
    - Log difficulty from request body and validation result
    - _Requirements: 2.2, 4.4_

  - [x] 2.6 Add logging to AIService


    - Add log in `requestMove()` method in `src/lib/ai/ai-service.ts`
    - Log difficulty from request parameter
    - _Requirements: 2.2_

  - [x] 2.7 Enhance logging in PromptBuilder


    - Improve existing logs in `buildPrompt()` method in `src/lib/ai/prompt-builder.ts`
    - Add log before switch statement with difficulty value
    - Add log after switch statement confirming prompt type built
    - Add error log in default case
    - _Requirements: 2.3_

- [x] 3. Add difficulty validation to all components






  - [x] 3.1 Add validation to Game page

    - Import DifficultyValidator in `src/app/game/[id]/page.tsx`
    - Validate difficulty from URL params before creating settings
    - Normalize invalid values and log warning
    - _Requirements: 4.2, 4.5_


  - [x] 3.2 Add validation to useChessAI hook

    - Import DifficultyValidator in `src/hooks/useChessAI.ts`
    - Validate difficulty parameter in `requestAIMove()`
    - Normalize if needed and log warning
    - _Requirements: 4.3, 4.5_

  - [x] 3.3 Add validation to AI API endpoint


    - Import DifficultyValidator in `src/app/api/ai/move/route.ts`
    - Validate difficulty from request body
    - Normalize if needed and log warning
    - Return error if difficulty is missing
    - _Requirements: 4.4, 4.5_


  - [x] 3.4 Add validation to PromptBuilder

    - Import DifficultyValidator in `src/lib/ai/prompt-builder.ts`
    - Validate difficulty before switch statement
    - Add explicit default case with error log
    - _Requirements: 4.5_

- [ ] 4. Enhance AI response to include difficulty verification
  - [ ] 4.1 Update AIMoveResponse interface
    - Add optional `difficulty` field to interface in `src/types/ai.ts`
    - Add optional `requestedDifficulty` field for verification
    - _Requirements: 2.4_

  - [ ] 4.2 Update AIService to include difficulty in response
    - Modify `requestMove()` in `src/lib/ai/ai-service.ts` to include difficulty in response
    - Include in both success and fallback responses
    - _Requirements: 2.4_

  - [ ] 4.3 Update API endpoint to include difficulty in response
    - Modify response in `src/app/api/ai/move/route.ts` to include requestedDifficulty
    - _Requirements: 2.4_

- [ ] 5. Improve visual feedback in game UI
  - [ ] 5.1 Enhance AI info panel
    - Update AI info panel in `src/app/game/[id]/page.tsx`
    - Display difficulty name using `DifficultyValidator.getDisplayName()`
    - Display ELO range using `DifficultyValidator.getEloRange()`
    - Style difficulty name prominently
    - _Requirements: 3.1_

  - [ ] 5.2 Add difficulty to loading message
    - Update LoadingIA component in `src/components/ui/LoadingIA.tsx` to accept difficulty prop
    - Display difficulty level in thinking message
    - Update usage in Game page to pass difficulty
    - _Requirements: 3.2_

- [ ] 6. Test and verify the fix
  - [ ] 6.1 Manual testing of each difficulty level
    - Test 'facil' level - verify logs and AI behavior
    - Test 'medio' level - verify logs and AI behavior
    - Test 'dificil' level - verify logs and AI behavior
    - Test 'claseMundial' level - verify logs and AI behavior
    - Test 'experto' level - verify logs and AI behavior
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 6.2 Verify logging output
    - Check console logs show correct difficulty at each step
    - Verify no warnings about invalid difficulty
    - Verify PromptBuilder confirms correct prompt type
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 6.3 Verify UI feedback
    - Check AI info panel shows correct difficulty name
    - Check ELO range is displayed correctly
    - Check loading message shows difficulty
    - _Requirements: 3.1, 3.2_

  - [ ] 6.4 Test edge cases
    - Test with invalid difficulty in URL
    - Test with missing difficulty parameter
    - Verify default value is used and warning is logged
    - _Requirements: 4.5_
