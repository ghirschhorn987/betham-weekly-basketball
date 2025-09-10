//========================================
// Main functions
//========================================
function runOnce_MANUALLY() {
  if (USE_OVERRIDE_VALUES != true) {
    throw new Error("Aborting manual test! USE_OVERRIDE_VALUES is not true. USE_OVERRIDE_VALUES=" + USE_OVERRIDE_VALUES);
  }

  const gameDate = new Date("2025-08-28 00:00:00");
  // prepareRsvpSpreadsheetForDate(gameDate);
  // createAndSendRosterEmailForDate(gameDate);
  // createAndSendWaitlistEmailForGameDate(gameDate);
  // replyInitialToWaitlistEmailResponsesForGameDate(gameDate);
  // replyFinalToWaitlistEmailResponsesForGameDate(gameDate);
}

function runEveryMinute() {
  const lastRunDayOfWeekRange = getLastRunDayOfWeekRange();
  const lastStepThatWasRunRange = getLastStepThatWasRunRange();

  const lastRunDayOfWeek = getSpreadsheetRangeValuesAsArray(lastRunDayOfWeekRange)[0];
  const lastStepThatWasRun = getSpreadsheetRangeValuesAsArray(lastStepThatWasRunRange)[0];
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay();
  const currentHourOfDay = currentDate.getHours();

  // These variables represent which game emails need to be sent out on the current date. 
  // An empty string means not to send emails that day.
  // Roster emails are sent a few days in advance, waitlist emails are sent on game day.
  const gameDayString = getGameDayStringOfRosterEmailsToSendOnDate(currentDate);
  var gameDate;
  if (gameDayString != "") {
    gameDate = getDateForNextOccurrenceOfDay(gameDayString);
  }
  const waitlistDayString = getGameDayStringOfWaitlistEmailsToSendOnDate(currentDate);

  Logger.log("currentDate=" + currentDate);
  Logger.log("currentDayOfWeek=" + currentDayOfWeek);
  Logger.log("currentHourOfDay=" + currentHourOfDay);
  Logger.log("lastRunDayOfWeek=" + lastRunDayOfWeek);
  Logger.log("lastStepThatWasRun=" + lastStepThatWasRun);
  Logger.log("gameDayString=" + gameDayString);
  Logger.log("gameDate=" + gameDate);
  Logger.log("waitlistDayString=" + waitlistDayString);

  if (currentDayOfWeek != lastRunDayOfWeek) {
    // Start of day: reset values
    addValuesArrayToSpreadsheetRange(lastRunDayOfWeekRange, [currentDayOfWeek], false);
    addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, [""], false);

  } else if (currentHourOfDay >= 6 && currentHourOfDay <= 7) {
    // Between 6am and 7:59am: crete rsvp spreadsheet if not created
    if (gameDayString != "" && lastStepThatWasRun != "CREATE RSVP SPREADSHEET") {
      prepareRsvpSpreadsheetForDate(gameDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["CREATE RSVP SPREADSHEET"], false);
    }
  }

  else if (currentHourOfDay >= 8 && currentHourOfDay <= 9) {
    // Between 8am and 9:59am: send roster emails if not sent
    if (gameDayString != "" && lastStepThatWasRun != "ROSTER EMAIL") {
      createAndSendRosterEmailForDate(gameDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["ROSTER EMAIL"], false);
    }

  } else if (currentHourOfDay == 12) {
    // At 12 noon: send waitlist emails if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "WAITLIST EMAIL") {
      createAndSendWaitlistEmailForGameDate(currentDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["WAITLIST EMAIL"], false);
    }

  } else if (currentHourOfDay == 13) {
    // At 1 pm: send initial waitlist reply if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "INITIAL WAITLIST REPLY") {
      replyInitialToWaitlistEmailResponsesForGameDate(currentDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["INITIAL WAITLIST REPLY"], false);
    }

  } else if (currentHourOfDay >= 17 && currentHourOfDay <= 19) {
    // Between 5 and 7:59pm: send initial waitlist reply if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "FINAL WAITLIST REPLY") {
      replyFinalToWaitlistEmailResponsesForGameDate(currentDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["FINAL WAITLIST REPLY"], false);
    }
  }

}

//========================================
// High-level functions
//========================================

function prepareRsvpSpreadsheetForDate(gameDate) {
  addRsvpTabForDate(gameDate);
  const previousGameDate = addDaysToDate(gameDate, -7);
  hideRsvpTabForDate(previousGameDate);
}

function addRsvpTabForDate(gameDate) {
  const dayString = getDateAsDayString(gameDate);
  Logger.log("Preparing RSVP spreadsheet for: " + dayString + ", " + gameDate);

  // Create new sheet 
  const templateRsvpTab = getRsvpTabFromTemplateSpreadsheet(gameDate);
  const rsvpSpreadsheet = getRsvpSpreadsheet(dayString);
  const newRsvpTab = copyTemplateRsvpTabToRsvpSpreadsheetTab(templateRsvpTab, rsvpSpreadsheet);

  newRsvpTab.setName(getRsvpTabNameForDate(gameDate, dayString));

  // Set date in new tab
  newRsvpTab.showSheet();
  rsvpSpreadsheet.setActiveSheet(newRsvpTab);
  newRsvpTab.getRange("A7").getCell(1, 1).setValue(getRsvpTabNameForDate(gameDate, dayString));

  // Add RSVP for Gary
  if (!isNoGameOnDate(gameDate) && AUTOMATICALLY_RSVP_FOR_GHIRSCHHORN) {
    newRsvpTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 1).setValue(GHIRSCHHORN_NAME);
    newRsvpTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 2).setValue(GHIRSCHHORN_EMAIL);
  }

  Logger.log("Finished preparing RSVP spreadsheet for: " + dayString + ", " + gameDate);
}

function hideRsvpTabForDate(gameDate) {
  Logger.log("Hiding RSVP Table for date: " + gameDate);
  const dayString = getDateAsDayString(gameDate);
  const rsvpSpreadsheet = getRsvpSpreadsheet(dayString);
  const oldTab = getRsvpTabForDate(rsvpSpreadsheet, gameDate, dayString);
  Logger.log("Hiding oldTab: " + oldTab);
  oldTab.hideSheet();
}

function createAndSendRosterEmailForDate(gameDate) {
  const gameDayString = getDateAsDayString(gameDate);
  if (isNoGameOnDate(gameDate)) {
    Logger.log("Not creating and sending roster emails because no game. day=" + gameDayString + ", date=" + gameDate);
    return;
  }

  Logger.log("Creating and sending roster emails for day=" + gameDayString + ", date=" + gameDate);
  const emails = getRosterGroupEmails(gameDayString);
  const subject = getRosterEmailSubject(gameDayString);
  const body = getRosterEmailBody(gameDayString, false);
  const htmlBody = getRosterEmailBody(gameDayString, true);
  sendEmail(emails, subject, body, htmlBody);
  Logger.log("Finished creating and sending roster emails for day=" + gameDayString + ", date=" + gameDate);
}

function createAndSendWaitlistEmailForGameDate(gameDate) {
  const gameDayString = getDateAsDayString(gameDate);
  Logger.log("Sending waitlist emails for day=" + gameDayString + ", date=" + gameDate);
  const emails = getWaitlistGroupEmails(gameDayString);
  const subject = getWaitlistEmailSubjectForGameDate(gameDate);
  const body = getWaitlistEmailBody(gameDayString, false);
  const htmlBody = getWaitlistEmailBody(gameDayString, true);
  sendEmail(emails, subject, body, htmlBody);
  Logger.log("Finished sending waitlist emails for day=" + gameDayString + ", date=" + gameDate);
}

function replyInitialToWaitlistEmailResponsesForGameDate(gameDate) {
  const gameDayString = getDateAsDayString(gameDate);
  Logger.log("Initial replying to waitlist email responses for day=" + gameDayString + ", gameDate=" + gameDate);

  // Collect responses and classify by group
  var inResponsesMapPrimary = new Map();
  var inResponsesMapSecondary = new Map();
  const outResponsesMap = new Map();
  const otherResponsesMap = new Map();
  addWaitlistEmailResponsesToMapsForGameDateByGroup(gameDate, inResponsesMapPrimary, inResponsesMapSecondary, outResponsesMap, otherResponsesMap);

  // Randomize each group separately
  inResponsesMapPrimary = shuffleMap(inResponsesMapPrimary);
  inResponsesMapSecondary = shuffleMap(inResponsesMapSecondary);

  Logger.log("\r\nInitial IN PRIMARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapPrimary.keys())));
  Logger.log("\r\nInitial IN SECONDARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapSecondary.keys())));
  Logger.log("\r\nInitial OUT:\r\n" + arrayAsNewLineSeparatedString(Array.from(outResponsesMap.keys())));
  Logger.log("\r\nInitial OTHER:\r\n" + arrayAsNewLineSeparatedString(Array.from(otherResponsesMap.keys())));

  const openSpotCount = getOpenSpotCountForDate(gameDate);
  Logger.log("Open spots for " + getDateAsString(gameDate) + ": " + openSpotCount);

  // Add primary first, then secondary
  const range = getRsvpSpreadsheetRangeForGameDate(gameDate, RSVP_CELLS_WAITLIST_RANGE);
  const playersAddedArray = addValuesArrayToSpreadsheetRange(
    range,
    [...Array.from(inResponsesMapPrimary.keys()), ...Array.from(inResponsesMapSecondary.keys())],
    true
  );

  const thread = getWaitlistEmailThreadForGameDate(gameDate);
  const htmlBody = getInitialWaitlistReplyEmailBody(gameDayString, openSpotCount, playersAddedArray, true);
  forwardEmail(thread, EMAIL_GROUP_ADMINS + "," + playersAddedArray.toString(), htmlBody, "first");

  Logger.log("Finished initial replying to waitlist email responses for day=" + gameDayString + ", gameDate=" + gameDate);
}


function replyFinalToWaitlistEmailResponsesForGameDate(gameDate) {
  const gameDayString = getDateAsDayString(gameDate);
  Logger.log("Final replying to waitlist email responses for day=" + gameDayString + ", gameDate=" + gameDate);

  const waitlistRange = getRsvpSpreadsheetRangeForGameDate(gameDate, RSVP_CELLS_WAITLIST_RANGE);
  const waitlistPlayerSet = getPlayerSetFromRange(waitlistRange);
  Logger.log("Initial waitlistPlayerSet=" + Array.from(waitlistPlayerSet));

  // Collect responses and classify by group
  var inResponsesMapPrimary = new Map();
  var inResponsesMapSecondary = new Map();
  const outResponsesMap = new Map();
  const otherResponsesMap = new Map();
  addWaitlistEmailResponsesToMapsForGameDateByGroup(gameDate, inResponsesMapPrimary, inResponsesMapSecondary, outResponsesMap, otherResponsesMap);
  Logger.log("\r\nFinal IN PRIMARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapPrimary.keys())));
  Logger.log("\r\nFinal IN SECONDARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapSecondary.keys())));
  Logger.log("\r\nFinal OUT:\r\n" + arrayAsNewLineSeparatedString(Array.from(outResponsesMap.keys())));
  Logger.log("\r\nFinal OTHER:\r\n" + arrayAsNewLineSeparatedString(Array.from(otherResponsesMap.keys())));

  for (const item of inResponsesMapPrimary.keys()) {
    waitlistPlayerSet.add(item);
  }
  for (const item of inResponsesMapSecondary.keys()) {
    waitlistPlayerSet.add(item);
  }
  for (const item of outResponsesMap.keys()) {
    waitlistPlayerSet.delete(item);
  }
  Logger.log("Modified waitlistPlayerSet=" + Array.from(waitlistPlayerSet));

  const openSpotCountBeforeAdding = getOpenSpotCountForDate(gameDate);
  Logger.log("Initial openSpotCountBeforeAdding=" + openSpotCountBeforeAdding);

  waitlistRange.clearContent();
  const rsvpRange = getRsvpSpreadsheetRangeForGameDate(gameDate, RSVP_CELLS_RANGE);
  const playersAddedArray = addValuesArrayToSpreadsheetRange(rsvpRange, Array.from(waitlistPlayerSet), true);

  Logger.log("openSpotCount after adding =" + getOpenSpotCountForDate(gameDate));

  const inGame = new Set();
  const waitlistForGame = new Set();
  var i = 1;
  playersAddedArray.forEach(function (item) {
    if (i <= openSpotCountBeforeAdding) {
      inGame.add(item);
    } else {
      waitlistForGame.add(item);
    }
    i++;
  });

  const thread = getWaitlistEmailThreadForGameDate(gameDate);
  const htmlBody = getFinalWaitlistReplyEmailBody(gameDayString, openSpotCountBeforeAdding, Array.from(inGame), Array.from(waitlistForGame), true);
  forwardEmail(thread, EMAIL_GROUP_ADMINS + "," + playersAddedArray.toString(), htmlBody, "last");

  Logger.log("Finished final replying to waitlist email responses for day=" + gameDayString + ", gameDate=" + gameDate);
}

// Helper to classify responses by group
function addWaitlistEmailResponsesToMapsForGameDateByGroup(gameDate, inResponsesMapPrimary, inResponsesMapSecondary, outResponsesMap, otherResponsesMap) {
  const dayString = getDateAsDayString(gameDate);
  Logger.log("addWaitlistEmailResponsesToMapsForDayByGroup(dayString). dayString=" + dayString + ", gameDate=" + gameDate);
  const thread = getWaitlistEmailThreadForGameDate(gameDate);

  var rosterTypeToPlayerStrings = getRosterTypeToPlayerStrings();

  const messages = thread.getMessages();
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];

    // getBody() gets the HTML body, which makes it hard to find what the reply started with.
    // So we use getPlainBody() to get just the text.
    // But this may have its own issues: I had a case where this string was not starting with "Out" on ghirschhorn987 replies
    // to group but it reported it did. Not sure where it got it from -- possibly/probably from an earlier reply in the thread
    // and it got confused.
    var latestReply = msg.getPlainBody();
    var playerString = normalizePlayerString(msg.getFrom());
    Logger.log("WaitlistEmailReply. msg.getFrom()=" + msg.getFrom() + ", playerString=" + playerString);

    if (isInGameReply(latestReply)) {
      if (isMainRosterPlayerString(playerString, rosterTypeToPlayerStrings)) {
        Logger.log("IN reply -- primary wait list.");
        addPlayerStringToMap(inResponsesMapPrimary, playerString, latestReply);
      } else {
        Logger.log("IN reply -- secondary wait list.");
        addPlayerStringToMap(inResponsesMapSecondary, playerString, latestReply);
      }
      deletePlayerStringFromMap(outResponsesMap, playerString);
    }
    else if (isOutOfGameReply(latestReply)) {
      Logger.log("OUT reply.");
      addPlayerStringToMap(outResponsesMap, playerString, latestReply);
      deletePlayerStringFromMap(inResponsesMapPrimary, playerString);
      deletePlayerStringFromMap(inResponsesMapSecondary, playerString);
    } else {
      Logger.log("OTHER reply.");
      addPlayerStringToMap(otherResponsesMap, playerString, latestReply);
    }
  }
}

//========================================
// Script-specific helper functions
//========================================
function getRsvpTabFromTemplateSpreadsheet(date) {
  Logger.log("getRsvpTabFromTemplateSpreadsheet(date). date=" + date);
  const templateSpreadsheet = SpreadsheetApp.openById(SIGNUP_SHEET_TEMPLATE_SPREADSHEET_ID);
  var templateTab;
  var isNoGame = isNoGameOnDate(date);
  Logger.log("isNoGameOnDate(date)=" + isNoGame);
  if (isNoGame) {
    templateTab = templateSpreadsheet.getSheetByName(SIGNUP_SHEET_TEMPLATE_NO_GAME_TAB_NAME);
  } else {
    templateTab = templateSpreadsheet.getSheetByName(SIGNUP_SHEET_TEMPLATE_GAME_RSVPS_TAB_NAME);
  }
  return templateTab;
}

function copyTemplateRsvpTabToRsvpSpreadsheetTab(templateRsvpTab, rsvpSpreadsheet) {
  const newTab = templateRsvpTab.copyTo(rsvpSpreadsheet);
  return newTab;
}

function isInGameReply(latestReply) {
  var normalizedMessage = latestReply.trimStart().toLowerCase();
  return normalizedMessage.startsWith(WAITLIST_IN_GAME_REPLY_LOWERCASE);
}

function isOutOfGameReply(latestReply) {
  var normalizedMessage = latestReply.trimStart().toLowerCase();
  var isOutOfGameReply = normalizedMessage.startsWith(WAITLIST_OUT_OF_GAME_REPLY_LOWERCASE);
  return isOutOfGameReply;
}

function getGameTimeString(dayString) {
  switch (dayString) {
    case "sunday": return GAME_TIME_STRING_SUNDAY;
    case "tuesday": return GAME_TIME_STRING_TUESDAY;
    case "thursday": return GAME_TIME_STRING_THURSDAY;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getRosterGroupEmails(dayString) {
  switch (dayString) {
    case "sunday": return EMAIL_GROUP_SUNDAY + ", " + EMAIL_GROUP_ADMINS;
    case "tuesday": return EMAIL_GROUP_TUESDAY + ", " + EMAIL_GROUP_ADMINS;
    case "thursday": return EMAIL_GROUP_THURSDAY + ", " + EMAIL_GROUP_ADMINS;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getWaitlistGroupEmails(dayString) {
  switch (dayString) {
    case "sunday":
      return EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_SUNDAY + ", " + EMAIL_GROUP_ADMINS;
    case "tuesday":
      return EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_TUESDAY + ", " + EMAIL_GROUP_ADMINS;
    case "thursday":
      return EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_THURSDAY + ", " + EMAIL_GROUP_ADMINS;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getRsvpSignupUrl(dayString) {
  switch (dayString) {
    case "sunday": return RSVP_SHORT_URL_SUNDAY;
    case "tuesday": return RSVP_SHORT_URL_TUESDAY;
    case "thursday": return RSVP_SHORT_URL_THURSDAY;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getRsvpSignupAlternateUrl(dayString) {
  switch (dayString) {
    case "sunday": return RSVP_URL_SUNDAY;
    case "tuesday": return RSVP_URL_TUESDAY;
    case "thursday": return RSVP_URL_THURSDAY;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function isNoGameOnDate(currentDate) {
  return NO_GAME_DATES.has(getDateAsString(currentDate));
}

// For a given date, returns whether roster RSVP emails need to be sent, and if so, which
// game day to send for. If blank, no RSVP emails need to be sent on that date.  If not 
// blank, RSVP emails need to be sent for upcoming day returned.
function getGameDayStringOfRosterEmailsToSendOnDate(currentDate) {
  let dayString = "";
  const dayOfWeek = currentDate.getDay();
  switch (dayOfWeek) {
    case 0: dayString = "tuesday";
      break;
    case 1: dayString = "thursday";
      break;
    case 3: dayString = "sunday";
      break;
    case 2:
    case 4:
    case 5:
    case 6:
      dayString = "";
      break;
    default: throw new Error("Error with currentDate: " + currentDate);
  }

  return dayString;
}

// For a given date, returns whether waitlist emails need to be sent, and if so, which
// game day to send for. If blank, no waitlist emails need to be sent on that date.  If not 
// blank, waitlist emails need to be sent for day returned.
function getGameDayStringOfWaitlistEmailsToSendOnDate(currentDate) {
  let dayString = "";

  const dayOfWeek = currentDate.getDay();
  switch (dayOfWeek) {
    case 0: dayString = "sunday";
      break;
    case 2: dayString = "tuesday";
      break;
    case 4: dayString = "thursday";
      break;
    case 1:
    case 3:
    case 5:
    case 6:
      dayString = "";
      break;
    default: throw new Error("Error with currentDate: " + currentDate);
  }

  // If no game on a normally scheduled date, don't send email.
  if (dayString != "") {
    if (isNoGameOnDate(currentDate)) {
      dayString = "";
    }
  }

  return dayString;
}

function getWaitlistEmailThreadForGameDate(gameDate) {
  const subject = "\"" + getWaitlistEmailSubjectForGameDate(gameDate) + "\"";
  const query = "from: " + GHIRSCHHORN_EMAIL + " subject: " + subject;
  return getOnlyEmailThreadForSearchQuery(query);
}

function getOnlyEmailThreadForSearchQuery(query) {
  const threads = getEmailThreadsForSearchQuery(query);
  if (threads.length != 1) {
    for (const thread of threads) {
      Logger.log("Found email: '" + thread.getFirstMessageSubject() + "' threadId=" + thread.getId() + " lastMessageDate=" + thread.getLastMessageDate());
    }
    throw new Error("Unexpected number of email threads found. Expected 1 but found " + threads.length + ". Searched for '" + query + "'.");
  }
  return threads[0];
}

function getEmailThreadsForSearchQuery(query) {
  const threads = GmailApp.search(query);
  return threads;
}
