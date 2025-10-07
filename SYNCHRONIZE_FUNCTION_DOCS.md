# synchronizeWaitlistWithRsvpSpreadsheet Function Documentation

## Overview
The `synchronizeWaitlistWithRsvpSpreadsheet()` function is a new addition to the Google Apps Script basketball management project that synchronizes waitlist email responses with the RSVP spreadsheet.

## Function Signature
```javascript
function synchronizeWaitlistWithRsvpSpreadsheet(gameDate)
```

## Parameters
- `gameDate` (Date): The date of the game to synchronize waitlist responses for

## Functionality

### Step 1: Get Current Waitlist Status
- Uses the existing `addWaitlistEmailResponsesToMapsForGameDateByGroup()` function
- Retrieves four maps:
  - `inResponsesMapPrimary`: Players from primary waitlist who replied "In"
  - `inResponsesMapSecondary`: Players from secondary waitlist who replied "In"  
  - `outResponsesMap`: Players who replied "Out"
  - `otherResponsesMap`: Players with other/invalid responses

### Step 2: Handle "Out" Players
- For each player in `outResponsesMap`:
  - Searches both in-game range (`RSVP_CELLS_IN_GAME_RANGE`) and waitlist range (`RSVP_CELLS_WAITLIST_RANGE`)
  - Removes their entry if found using the `removePlayerFromRange()` helper function
  - Logs the number of players removed

### Step 3: Handle "In" Players
- For each player in both `inResponsesMapPrimary` and `inResponsesMapSecondary`:
  - Checks if they're already signed up in either in-game or waitlist ranges
  - Uses `isPlayerInSet()` helper function for email-based comparison
  - Adds new players to the first available waitlist spot
  - Primary players are processed first, then secondary players

### Step 4: Move Waitlist to Open Spots
- Checks for open spots in the in-game range using `getOpenSpotCountForDate()`
- If open spots exist and players are in waitlist:
  - Uses `getPlayerArrayFromRange()` to preserve waitlist order
  - Moves players from top of waitlist to in-game spots one-by-one
  - Preserves waitlist order (first in waitlist = first to move to game)
  - Logs each player movement

### Step 5: Compress Waitlist
- Eliminates gaps in the waitlist range while preserving order
- Uses `getPlayerArrayFromRange()` to get current waitlist in order
- Uses `clearAndSetRangeValues()` to clear and re-add players without gaps
- Maintains the exact order of remaining waitlist players

## Helper Functions

### removePlayerFromRange(range, playerString)
- **Purpose**: Removes a specific player from a spreadsheet range
- **Parameters**: 
  - `range`: The spreadsheet range to search
  - `playerString`: The player string to remove
- **Returns**: Number of players removed (0 or 1)
- **Logic**: 
  - Iterates through each row in the range
  - Uses `playerStringsAreEqual()` for comparison
  - Clears both name and email columns when match is found

### isPlayerInSet(playerString, playerSet)
- **Purpose**: Checks if a player is in a set using email-based comparison
- **Parameters**:
  - `playerString`: The player to check for
  - `playerSet`: The set of players to search in
- **Returns**: Boolean indicating if player is found
- **Logic**:
  - Extracts email addresses using `getEmailFromPlayerString()`
  - Performs case-insensitive email comparison
  - Allows for different names with same email

## Integration with Existing Code

### Uses Existing Functions
- `addWaitlistEmailResponsesToMapsForGameDateByGroup()`: Gets email responses
- `getRsvpSpreadsheetRangeForGameDate()`: Gets spreadsheet ranges
- `getPlayerArrayFromRange()`: Gets current players in a range (order-preserving)
- `getPlayerSetFromRange()`: Gets current players in a range (for membership checks)
- `getOpenSpotCountForDate()`: Counts available spots
- `addValuesArrayToSpreadsheetRange()`: Adds players to spreadsheet (order-preserving)
- `clearAndSetRangeValues()`: Clears range and sets values in order
- `normalizePlayerString()`, `playerStringsAreEqual()`: Player string utilities
- `getEmailFromPlayerString()`: Email extraction

### Uses Existing Constants
- `RSVP_CELLS_IN_GAME_RANGE`: First 15 spots for confirmed players
- `RSVP_CELLS_WAITLIST_RANGE`: Waitlist spots
- `RSVP_CELLS_RANGE`: Combined range for all players

### Follows Existing Patterns
- Comprehensive logging for debugging
- Error handling with try-catch blocks
- Player string normalization and comparison
- Respects spreadsheet structure and ranges

## Error Handling
- Wrapped in try-catch block with detailed error logging
- Validates ranges and data before operations
- Gracefully handles empty lists and edge cases
- Throws errors up the call stack for proper handling

## Logging
- Logs all major operations for debugging
- Reports counts of players processed at each step
- Provides detailed information about player movements
- Includes timing information with game date and day string

## Usage Example
```javascript
// Synchronize waitlist for a specific game date
const gameDate = new Date("2025-08-28 00:00:00");
synchronizeWaitlistWithRsvpSpreadsheet(gameDate);
```

## Notes
- Function preserves existing waitlist order when compressing
- Primary waitlist players always have priority over secondary
- Email-based player matching allows for name variations
- Function is idempotent - safe to run multiple times
- Compatible with existing project testing and override patterns