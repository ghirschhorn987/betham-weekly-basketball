//========================================
// Roster spreadsheet helper functions
//========================================
function getRosterEmailRangeName(day) {
  switch (day) {
    case "sunday": return ROSTER_EMAIL_RANGE_NAME_SUNDAY;
    case "tuesday": return ROSTER_EMAIL_RANGE_NAME_TUESDAY;
    case "thursday": return ROSTER_EMAIL_RANGE_NAME_THURSDAY;
    default: throw new Error("Unknown day: " + day);
  }
}

function getLastRunDayOfWeekRange() {
  const spreadsheet = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  return spreadsheet.getRangeByName(LAST_RUN_DAY_OF_WEEK_RANGE);
}

function getLastStepThatWasRunRange() {
  const spreadsheet = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  return spreadsheet.getRangeByName(LAST_STEP_THAT_WAS_RUN_RANGE);
}

//========================================
// Rsvp spreadsheet helper functions
//========================================
function getRsvpSpreadsheetId(day) {
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_RSVP_SPREADSHEET_ID;
  }

  switch (day) {
    case "sunday": return RSVP_SUNDAY_SPREADSHEET_ID;
    case "tuesday": return RSVP_TUESDAY_SPREADSHEET_ID;
    case "thursday": return RSVP_THURSDAY_SPREADSHEET_ID;
    default: throw new Error("Unknown day: " + day);
  }
}

function getRsvpSpreadsheetRangeForDay(day, rangeSpec) {
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(day));
  const nextDate = getDateForNextOccurrenceOfDay(day);
  const tab = getRsvpTabForDate(spreadsheet, nextDate, day);
  if (tab == null) {
    throw new Error("No tab found. spreadsheet=" + spreadsheet.getName() + ", nextDate=" + nextDate + ", day=" + day + ", tabName= " + getRsvpTabNameForDate(nextDate, day));
  }
  return tab.getRange(rangeSpec);
}

function getRsvpTabForDate(spreadsheet, date, day) {
  const tabName = getRsvpTabNameForDate(date, day);
  return spreadsheet.getSheetByName(tabName);
}

function getRsvpTabNameForDate(date, day) {
  var gameTimeString = null;
  if (isNoGameOnDate(date)) {
    gameTimeString = " - " + NO_GAME_STRING;
  } else {
    gameTimeString = ", " + getGameTimeString(day);
  }
  return getShortDayName(day) + ", " + date.toLocaleString("en-us", { month: 'short', day: 'numeric' }) + gameTimeString;
}

function getMonthNumberFromRsvpTabName(tabName) {
  // Example tabName: "Tue, Jul 18, 5-6pm"
  // Example tabName: "Thu, Sep 2 - NO GAME"
  // Split into dayOfWeek, monthAndDay, time
  const regex = /(.*?), (.*?)(, | - )(.*)/;
  const parts = regex.exec(tabName);
  return new Date(parts[2]).getMonth();
}

function getOpenSpotCount(day) {
  var openSpotCount = 0;
  const range = getRsvpSpreadsheetRangeForDay(day, RSVP_CELLS_IN_GAME_RANGE);
  for (row = 1; row <= range.getHeight(); row++) {
    const cell = range.getCell(row, 1);
    if (cell.isBlank()) {
      openSpotCount++;
    }
  }
  return openSpotCount;
}

function getPlayerSetFromRsvpWaitlistRange(day) {
  const waitlistRange = getRsvpSpreadsheetRangeForDay(day, RSVP_CELLS_WAITLIST_RANGE);
  return getPlayerSetFromRange(waitlistRange);
}

function getPlayerSetFromRange(range) {
  var playerSet = new Set();
  for (row = 1; row <= range.getHeight(); row++) {
    const cell = range.getCell(row, 1);
    if (!cell.isBlank()) {
      playerSet.add(cell.getValue());
    }
  }
  return playerSet;
}

function addPlayerSetToSpreadsheetRange(range, requestedPlayersToAddSet) {
  Logger.log("Requested to add " + requestedPlayersToAddSet.size + " players to range.");
  var currentPlayersInRangeSet = getPlayerSetFromRange(range);
  var playersToAddSet = requestedPlayersToAddSet;
  playersToAddSet = removeDuplicatePlayersFromSet(playersToAddSet);
  playersToAddSet = removePlayersAlreadyInOtherSet(playersToAddSet, currentPlayersInRangeSet);
  Logger.log("Removed " + (requestedPlayersToAddSet.size - playersToAddSet.size) + " duplicates and players already in target range from requested players to add.");

  const playersAdded = addValuesToSpreadsheetRange(range, playersToAddSet, skipBlankCells);
  return playersToAddSet;
}
