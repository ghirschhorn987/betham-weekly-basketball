//========================================
// Roster spreadsheet helper functions
//========================================
function getRosterSpreadsheetId() {
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_ROSTER_SPREADSHEET_ID;
  }
  return ROSTER_SPREADSHEET_ID;
}

function getRosterSpreadsheet() {
  return SpreadsheetApp.openById(getRosterSpreadsheetId);
}

function getRosterEmailRangeName(dayString) {
  switch (dayString) {
    case "sunday": return ROSTER_EMAIL_RANGE_NAME_SUNDAY;
    case "tuesday": return ROSTER_EMAIL_RANGE_NAME_TUESDAY;
    case "thursday": return ROSTER_EMAIL_RANGE_NAME_THURSDAY;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getLastRunDayOfWeekRange() {
  return getRosterSpreadsheet().getRangeByName(LAST_RUN_DAY_OF_WEEK_RANGE);
}

function getLastStepThatWasRunRange() {
  return getRosterSpreadsheet().getRangeByName(LAST_STEP_THAT_WAS_RUN_RANGE);
}

//========================================
// Rsvp spreadsheet helper functions
//========================================
function getRsvpSpreadsheetId(dayString) {
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_RSVP_SPREADSHEET_ID;
  }

  switch (dayString) {
    case "sunday": return RSVP_SUNDAY_SPREADSHEET_ID;
    case "tuesday": return RSVP_TUESDAY_SPREADSHEET_ID;
    case "thursday": return RSVP_THURSDAY_SPREADSHEET_ID;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getRsvpSpreadsheet(dayString) {
  return SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));
}

function getRsvpSpreadsheetRangeForGameDate(gameDate, rangeSpec) {
  const dayString = getDateAsDayString(gameDate);
  const rsvpSpreadsheet = getRsvpSpreadsheet(dayString);
  const tab = getRsvpTabForDate(rsvpSpreadsheet, gameDate, dayString);
  if (tab == null) {
    throw new Error("No tab found. rsvpSpreadsheet=" + rsvpSpreadsheet.getName() + ", gameDate=" + gameDate + ", day=" + dayString + ", tabName= " + getRsvpTabNameForDate(gameDate, dayString));
  }
  return tab.getRange(rangeSpec);
}

function getRsvpTabForDate(spreadsheet, date, dayString) {
  const tabName = getRsvpTabNameForDate(date, dayString);
  return spreadsheet.getSheetByName(tabName);
}

function getRsvpTabNameForDate(date, dayString) {
  var gameTimeString = null;
  if (isNoGameOnDate(date)) {
    gameTimeString = " - " + NO_GAME_STRING;
  } else {
    gameTimeString = ", " + getGameTimeString(dayString);
  }
  return getShortDayName(dayString) + ", " + date.toLocaleString("en-us", { month: 'short', day: 'numeric' }) + gameTimeString;
}

function getMonthNumberFromRsvpTabName(tabName) {
  // Example tabName: "Tue, Jul 18, 5-6pm"
  // Example tabName: "Thu, Sep 2 - NO GAME"
  // Split into dayOfWeek, monthAndDay, time
  const regex = /(.*?), (.*?)(, | - )(.*)/;
  const parts = regex.exec(tabName);
  return new Date(parts[2]).getMonth();
}

function getOpenSpotCountForDate(gameDate) {
  const range = getRsvpSpreadsheetRangeForGameDate(gameDate, RSVP_CELLS_IN_GAME_RANGE);
  let openSpotCount = 0;
  for (let row = 1; row <= range.getHeight(); row++) {
    const cell = range.getCell(row, 1);
    if (cell.isBlank()) {
      openSpotCount++;
    }
  }
  return openSpotCount;
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
