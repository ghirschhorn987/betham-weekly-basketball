//========================================
// Main functions
//========================================
function runOnce_MANUALLY() {
  // const dayString = "monday";
  //const date = getDateForNextOccurrenceOfDay(dayString);
  // const date = new Date("2025-06-12");
  // createAndSendRosterEmailForDateAndDay(date, dayString);

  // for (x=0; x<100; x++) {
  // const lastStepThatWasRunRange = getLastStepThatWasRunRange();
  //createAndSendWaitlistEmailForDay("thursday");
  //addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["WAITLIST EMAIL"], false);
  //replyInitialToWaitlistEmailResponsesForDay("thursday");
  //addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["INITIAL WAITLIST REPLY"], false);
  //replyFinalToWaitlistEmailResponsesForDay("thursday");
  // }

  // const currentDate = new Date("2023-07-12");
  // addRsvpTabForDate(currentDate);
  //prepareRsvpSpreadsheetForDate(new Date("2025-06-01 00:00:00"));

  //const currentDate = new Date();
  // const currentDate = new Date("2025-06-29");

  // const currentDayOfWeek = currentDate.getDay();
  // Logger.log("currentDate=" + currentDate);
  // const rosterDayString = getGameDayStringOfRosterEmailsToSendOnDate(currentDate);
  // Logger.log("rosterDayString=" + rosterDayString);
  // var rosterDate;
  // if (rosterDayString != "") {
  //   rosterDate = getDateForNextOccurrenceOfDay(rosterDayString);
  // }
  // Logger.log("rosterDate=" + rosterDate);
  // const rosterDay = getDateAsDayString(rosterDate);
  // Logger.log("rosterDay=" + rosterDay);
  // const currentDay = getDateAsDayString(currentDate);
  // Logger.log("currentDay=" + currentDay);

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
  const rosterDayString = getGameDayStringOfRosterEmailsToSendOnDate(currentDate);
  var rosterDate;
  if (rosterDayString != "") {
    rosterDate = getDateForNextOccurrenceOfDay(rosterDayString);
  }
  const waitlistDayString = getGameDayStringOfWaitlistEmailsToSendOnDate(currentDate);

  Logger.log("currentDate=" + currentDate);
  Logger.log("currentDayOfWeek=" + currentDayOfWeek);
  Logger.log("currentHourOfDay=" + currentHourOfDay);
  Logger.log("lastRunDayOfWeek=" + lastRunDayOfWeek);
  Logger.log("lastStepThatWasRun=" + lastStepThatWasRun);
  Logger.log("rosterDayString=" + rosterDayString);
  Logger.log("rosterDate=" + rosterDate);
  Logger.log("waitlistDayString=" + waitlistDayString);

  if (currentDayOfWeek != lastRunDayOfWeek) {
    // Start of day: reset values
    addValuesArrayToSpreadsheetRange(lastRunDayOfWeekRange, [currentDayOfWeek], false);
    addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, [""], false);

  } else if (currentHourOfDay >= 6 && currentHourOfDay <= 7) {
    // Between 6am and 7:59am: crete rsvp spreadsheet if not created
    if (rosterDayString != "" && lastStepThatWasRun != "CREATE RSVP SPREADSHEET") {
      //prepareRsvpSpreadsheetForDay(rosterDayString);
      prepareRsvpSpreadsheetForDate(rosterDate);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["CREATE RSVP SPREADSHEET"], false);
    }
  }

  else if (currentHourOfDay >= 8 && currentHourOfDay <= 9) {
    // Between 8am and 9:59am: send roster emails if not sent
    if (rosterDayString != "" && lastStepThatWasRun != "ROSTER EMAIL") {
      createAndSendRosterEmailForDateAndDay(rosterDate, rosterDayString);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["ROSTER EMAIL"], false);
    }

  } else if (currentHourOfDay == 12) {
    // At 12 noon: send waitlist emails if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "WAITLIST EMAIL") {
      createAndSendWaitlistEmailForDay(waitlistDayString);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["WAITLIST EMAIL"], false);
    }

  } else if (currentHourOfDay == 13) {
    // At 1 pm: send initial waitlist reply if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "INITIAL WAITLIST REPLY") {
      replyInitialToWaitlistEmailResponsesForDay(waitlistDayString);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["INITIAL WAITLIST REPLY"], false);
    }

  } else if (currentHourOfDay >= 17 && currentHourOfDay <= 19) {
    // Between 5 and 7:59pm: send initial waitlist reply if not sent
    if (waitlistDayString != "" && lastStepThatWasRun != "FINAL WAITLIST REPLY") {
      replyFinalToWaitlistEmailResponsesForDay(waitlistDayString);
      addValuesArrayToSpreadsheetRange(lastStepThatWasRunRange, ["FINAL WAITLIST REPLY"], false);
    }
  }

}

//========================================
// High-level functions
//========================================

function prepareRsvpSpreadsheetForDay(dayString) {
  Logger.log("Preparing RSVP spreadsheet for day: " + dayString);

  const previousDate = getDateForPreviousOccurrenceOfDayString(dayString);
  const nextDate = getDateForNextOccurrenceOfDay(dayString);
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));

  Logger.log("previousDate=" + previousDate + ", next=" + nextDate);

  // Duplicate previous sheet and hide it. Set name of new sheet.
  const oldTab = getRsvpTabForDate(spreadsheet, previousDate, dayString);
  oldTab.activate();
  const newTab = spreadsheet.duplicateActiveSheet();
  newTab.setName(getRsvpTabNameForDate(nextDate, dayString));
  oldTab.hideSheet();

  // Set date in new tab
  newTab.showSheet();
  spreadsheet.setActiveSheet(newTab);
  newTab.getRange("A7").getCell(1, 1).setValue(getRsvpTabNameForDate(nextDate, dayString));

  // Clear RSVPs
  newTab.getRange(RSVP_CELLS_RANGE).clearContent();

  // Add RSVP for Gary
  if (!isNoGameOnDate(nextDate) && AUTOMATICALLY_RSVP_FOR_GHIRSCHHORN) {
    newTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 1).setValue(GHIRSCHHORN_NAME);
    newTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 2).setValue(GHIRSCHHORN_EMAIL);
  }

  Logger.log("Finished preparing RSVP spreadsheet for day: " + dayString);
}

function prepareRsvpSpreadsheetForDate(date) {
  addRsvpTabForDate(date);
  const dayString = getDateAsDayString(date);
  const previousDate = getDateForPreviousOccurrenceOfDayString(dayString);
  hideRsvpTabForDate(previousDate);
}

function addRsvpTabForDate(date) {
  const dayString = getDateAsDayString(date);
  Logger.log("Preparing RSVP spreadsheet for: " + dayString + ", " + date);

  // Create new sheet 
  const templateRsvpTab = getRsvpTabFromTemplateSpreadsheet(date);
  const rsvpSpreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));
  const newRsvpTab = copyTemplateRsvpTabToRsvpSpreadsheetTab(templateRsvpTab, rsvpSpreadsheet);

  newRsvpTab.setName(getRsvpTabNameForDate(date, dayString));

  // Set date in new tab
  newRsvpTab.showSheet();
  rsvpSpreadsheet.setActiveSheet(newRsvpTab);
  newRsvpTab.getRange("A7").getCell(1, 1).setValue(getRsvpTabNameForDate(date, dayString));

  // Add RSVP for Gary
  if (!isNoGameOnDate(date) && AUTOMATICALLY_RSVP_FOR_GHIRSCHHORN) {
    newRsvpTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 1).setValue(GHIRSCHHORN_NAME);
    newRsvpTab.getRange(RSVP_CELLS_IN_GAME_RANGE).getCell(1, 2).setValue(GHIRSCHHORN_EMAIL);
  }

  Logger.log("Finished preparing RSVP spreadsheet for: " + dayString + ", " + date);
}

function hideRsvpTabForDate(date) {
  Logger.log("Hiding RSVP Table for date: " + date);
  const dayString = getDateAsDayString(date);
  const rsvpSpreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));
  const oldTab = getRsvpTabForDate(rsvpSpreadsheet, date, dayString);
  Logger.log("Hiding oldTab: " + oldTab);
  oldTab.hideSheet();
}

function createAndSendRosterEmailForDateAndDay(date, dayString) {
  if (isNoGameOnDate(date)) {
    Logger.log("Not creating and sending roster emails because no game. day=" + dayString + ", date=" + date);
    return;
  }

  Logger.log("Creating and sending roster emails for day=" + dayString + ", date=" + date);
  const emails = getRosterGroupEmails(dayString);
  const subject = getRosterEmailSubject(dayString);
  const body = getRosterEmailBody(dayString, false);
  const htmlBody = getRosterEmailBody(dayString, true);
  sendEmail(emails, subject, body, htmlBody);
  Logger.log("Finished creating and sending roster emails for day=" + dayString + ", date=" + date);
}

function createAndSendWaitlistEmailForDay(day) {
  Logger.log("Sending waitlist emails for day: " + day);
  const emails = getWaitlistGroupEmails(day);
  const subject = getWaitlistEmailSubjectForDay(day);
  const body = getWaitlistEmailBody(day, false);
  const htmlBody = getWaitlistEmailBody(day, true);
  sendEmail(emails, subject, body, htmlBody);
  Logger.log("Finished sending waitlist emails for day: " + day);
}

function replyInitialToWaitlistEmailResponsesForDay(day) {
  Logger.log("Initial replying to waitlist email responses for day: " + day);
  var inResponsesMapPrimary = new Map();
  var inResponsesMapSecondary = new Map();
  const outResponsesMap = new Map();
  const otherResponsesMap = new Map();

  // Collect responses and classify by group
  addWaitlistEmailResponsesToMapsForDayByGroup(day, inResponsesMapPrimary, inResponsesMapSecondary, outResponsesMap, otherResponsesMap);

  // Randomize each group separately
  inResponsesMapPrimary = shuffleMap(inResponsesMapPrimary);
  inResponsesMapSecondary = shuffleMap(inResponsesMapSecondary);

  Logger.log("\r\nInitial IN PRIMARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapPrimary.keys())));
  Logger.log("\r\nInitial IN SECONDARY:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMapSecondary.keys())));
  Logger.log("\r\nInitial OUT:\r\n" + arrayAsNewLineSeparatedString(Array.from(outResponsesMap.keys())));
  Logger.log("\r\nInitial OTHER:\r\n" + arrayAsNewLineSeparatedString(Array.from(otherResponsesMap.keys())));

  const openSpotCount = getOpenSpotCount(day);
  Logger.log("Open spots: " + openSpotCount);

  // Add primary first, then secondary
  const range = getRsvpSpreadsheetRangeForDay(day, RSVP_CELLS_WAITLIST_RANGE);
  const playersAddedArray = addValuesArrayToSpreadsheetRange(
    range,
    [...Array.from(inResponsesMapPrimary.keys()), ...Array.from(inResponsesMapSecondary.keys())],
    true
  );

  const thread = getWaitlistEmailThreadForDay(day);
  const htmlBody = getInitialWaitlistReplyEmailBody(day, openSpotCount, playersAddedArray, true);
  forwardEmail(thread, EMAIL_GROUP_ADMINS + "," + playersAddedArray.toString(), htmlBody, "first");

  Logger.log("Finished initial replying to waitlist email responses for day: " + day);
}

// Helper to classify responses by group
function addWaitlistEmailResponsesToMapsForDayByGroup(day, inResponsesMapPrimary, inResponsesMapSecondary, outResponsesMap, otherResponsesMap) {
  const thread = getWaitlistEmailThreadForDay(day);
  const messages = thread.getMessages();
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var latestReply = msg.getPlainBody();
    var player = normalizePlayer(msg.getFrom());
    var groupType = getPlayerGroupType(day, player); // You need to implement this helper

    if (isInGameReply(latestReply)) {
      if (groupType === "PrimaryWaitlist") {
        addPlayerToMap(inResponsesMapPrimary, player, latestReply);
      } else if (groupType === "SecondaryWaitlist") {
        addPlayerToMap(inResponsesMapSecondary, player, latestReply);
      }
      deletePlayerFromMap(outResponsesMap, player);
    }
    else if (isOutOfGameReply(latestReply)) {
      addPlayerToMap(outResponsesMap, player, latestReply);
      deletePlayerFromMap(inResponsesMapPrimary, player);
      deletePlayerFromMap(inResponsesMapSecondary, player);
    } else {
      addPlayerToMap(otherResponsesMap, player, latestReply);
    }
  }
}

// Helper to get group type for a player
function getPlayerGroupType(dayString, playerEmail) {
  // First, check optional external spreadsheets for primary/secondary lists.
  try {
    if (PRIMARY_WAITLIST_SPREADSHEET_ID && PRIMARY_WAITLIST_SPREADSHEET_ID !== "") {
      const ssPrimary = SpreadsheetApp.openById(PRIMARY_WAITLIST_SPREADSHEET_ID);
      const sheetPrimary = ssPrimary.getSheets()[0];
      const valuesPrimary = sheetPrimary.getRange(1, 1, sheetPrimary.getLastRow(), 1).getValues();
      for (let i = 0; i < valuesPrimary.length; i++) {
        if (valuesPrimary[i][0] && valuesPrimary[i][0].toString().trim() === playerEmail) {
          return "PrimaryWaitlist";
        }
      }
    }
  } catch (e) {
    Logger.log("Error checking primary waitlist external sheet: " + e);
  }

  try {
    if (SECONDARY_WAITLIST_SPREADSHEET_ID && SECONDARY_WAITLIST_SPREADSHEET_ID !== "") {
      const ssSecondary = SpreadsheetApp.openById(SECONDARY_WAITLIST_SPREADSHEET_ID);
      const sheetSecondary = ssSecondary.getSheets()[0];
      const valuesSecondary = sheetSecondary.getRange(1, 1, sheetSecondary.getLastRow(), 1).getValues();
      for (let i = 0; i < valuesSecondary.length; i++) {
        if (valuesSecondary[i][0] && valuesSecondary[i][0].toString().trim() === playerEmail) {
          return "SecondaryWaitlist";
        }
      }
    }
  } catch (e) {
    Logger.log("Error checking secondary waitlist external sheet: " + e);
  }

  // Fallback: check the RSVP spreadsheet Players tab (existing behavior)
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));
  const tab = spreadsheet.getSheetByName("Players"); // Adjust tab name if needed
  const data = tab.getDataRange().getValues();
  const emailColIdx = data[0].indexOf("Email");
  const groupColIdx = data[0].indexOf("Group");
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailColIdx] === playerEmail) {
      return data[i][groupColIdx];
    }
  }
  return null;
}

//========================================
// Script-specific helper functions
//========================================
function getRsvpTabFromTemplateSpreadsheet(date) {
  Logger.log("getRsvpTabFromTemplateSpreadsheed(date). date=" + date);
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


function addWaitlistEmailResponsesToMapsForDay(day, inResponsesMap, outResponsesMap, otherResponsesMap) {
  const thread = getWaitlistEmailThreadForDay(day);
  addWaitlistEmailResponsesToMapsForThread(thread, inResponsesMap, outResponsesMap, otherResponsesMap);
}

function addWaitlistEmailResponsesToMapsForThread(thread, inResponsesMap, outResponsesMap, otherResponsesMap) {
  const messages = thread.getMessages();
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var latestReply = msg.getPlainBody();
    var player = normalizePlayer(msg.getFrom());
    if (isInGameReply(latestReply)) {
      addPlayerToMap(inResponsesMap, player, latestReply);
      deletePlayerFromMap(outResponsesMap, player);
    }
    else if (isOutOfGameReply(latestReply)) {
      addPlayerToMap(outResponsesMap, player, latestReply);
      deletePlayerFromMap(inResponsesMap, player);
    } else {
      addPlayerToMap(otherResponsesMap, player, latestReply);
    }
  }
}

function isInGameReply(latestReply) {
  return latestReply.trimStart().toLowerCase().startsWith(WAITLIST_IN_GAME_REPLY_LOWERCASE);
}

function isOutOfGameReply(latestReply) {
  return latestReply.trimStart().toLowerCase().startsWith(WAITLIST_OUT_OF_GAME_REPLY_LOWERCASE);
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

// Helper to get player emails by group type from spreadsheet
function getPlayerEmailsByGroup(dayString, groupType) {
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));
  const tab = spreadsheet.getSheetByName("Players"); // Adjust tab name if needed
  const data = tab.getDataRange().getValues();
  const groupColIdx = data[0].indexOf("Group"); // Assumes header row has "Group"
  const emailColIdx = data[0].indexOf("Email");
  let emails = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][groupColIdx] === groupType) {
      emails.push(data[i][emailColIdx]);
    }
  }
  return emails;
}

// Update getWaitlistGroupEmails to include both waitlist groups
function getWaitlistGroupEmails(dayString) {
  // Prefer explicit external spreadsheets if configured, otherwise fall back
  // to the RSVP spreadsheet "Players" tab and the Group column.
  const primary = getPlayerEmailsFromExternalOrPlayersTab(dayString, "PrimaryWaitlist");
  const secondary = getPlayerEmailsFromExternalOrPlayersTab(dayString, "SecondaryWaitlist");
  return [...primary, ...secondary, EMAIL_GROUP_ADMINS].join(", ");
}

// Reads emails for a group either from an external spreadsheet (if constant set)
// or from the RSVP spreadsheet Players tab (existing behavior).
function getPlayerEmailsFromExternalOrPlayersTab(dayString, groupType) {
  // Map groupType to optional external spreadsheet constants
  var externalSpreadsheetId = null;
  if (groupType === "PrimaryWaitlist") {
    externalSpreadsheetId = PRIMARY_WAITLIST_SPREADSHEET_ID;
  } else if (groupType === "SecondaryWaitlist") {
    externalSpreadsheetId = SECONDARY_WAITLIST_SPREADSHEET_ID;
  }

  // If an external spreadsheet ID is configured, try to read column A values
  if (externalSpreadsheetId && externalSpreadsheetId !== "") {
    try {
      const ss = SpreadsheetApp.openById(externalSpreadsheetId);
      const sheet = ss.getSheets()[0];
      const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
      const emails = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i][0];
        if (v && v.toString().trim() !== "") {
          emails.push(v.toString().trim());
        }
      }
      return emails;
    } catch (e) {
      Logger.log("Error reading external waitlist spreadsheet (" + externalSpreadsheetId + "): " + e);
      // fall through to fallback below
    }
  }

  // Fallback: read from RSVP Players tab by Group column
  return getPlayerEmailsByGroup(dayString, groupType);
}

// Not used as of 2023-01-01?
function getRosterEmailAddressesFromRosterSpreadsheet(dayString) {
  const spreadsheet = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  const emailRange = spreadsheet.getRangeByName(getRosterEmailRangeName(dayString));
  const emails = getSpreadsheetRangeValuesAsArray(emailRange);
  return emails.join(', ');
}

// Not used as of 2023-01-01?
function getWaitlistEmailAddressesFromRosterSpreadsheet(dayString) {
  const spreadsheet = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  const allEmails =
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(ALL_EMAIL_RANGE_NAME));
  const rosterEmailsForDay =
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(getRosterEmailRangeName(dayString)));

  var emails = removeFromArray(
    allEmails,
    rosterEmailsForDay);
  emails = removeDuplicatesFromArray(emails);
  return emails.join(', ');
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

function getWaitlistEmailThreadForDay(day) {
  const subject = "\"" + getWaitlistEmailSubjectForDay(day) + "\"";
  const query = "from: " + GHIRSCHHORN_EMAIL + " subject: " + subject;
  return getOnlyEmailThreadForSearchQuery(query);
}

function getWaitlistEmailThreadForDate(date) {
  const subject = "\"" + getWaitlistEmailSubjectForDate(date) + "\"";
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
