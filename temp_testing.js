// @ts-nocheck
//========================================
// TESTING ONLY
//========================================


/**
* Retrieves email threads within a date range, filters by author,
* extracts strings from matching replies, and returns date and extracted strings.
*
* @param {string} threadSubjectRegex Regular expression to match email thread titles.
* @param {string} replyBodyRegex Regular expression to match email reply bodies.
* @param {string} extractRegex Regular expression to extract desired strings from matching replies.
* @param {string} authorEmail The email of the author to filter by.
* @param {Date} startDate The start date for the email search.
* @param {Date} endDate The end date for the email search.
* @returns {Array<{emailDate: Date, extractedString: string}>} An array of objects, each with the email date and extracted string.
*/
function extractStringsFromEmailsWithFilters(threadSubjectRegex, replyBodyRegex, extractRegex, authorEmail, startDate, endDate) {
  if (!startDate || !endDate) {
    Logger.log('Error: startDate and endDate must be provided.');
    return [];
  }

  const formattedStartDate = Utilities.formatDate(startDate, Session.getScriptTimeZone(), "yyyy/MM/dd");
  const formattedEndDate = Utilities.formatDate(endDate, Session.getScriptTimeZone(), "yyyy/MM/dd");
  const query = `subject:${threadSubjectRegex} after:${formattedStartDate} before:${formattedEndDate}`;
  Logger.log('Gmail query: ' + query);

  const threads = GmailApp.search(query);

  if (!threads) {
    Logger.log('No threads found matching the search criteria.');
    return [];
  }

  let extractedData = [];

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();

    Logger.log("Thread " + (i + 1) + ": " + messages.length + " messages.");

    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      const replyBody = message.getBody();
      const messageAuthor = message.getFrom();
      const messageDate = message.getDate();

      // Filter by author
      if (messageAuthor && messageAuthor.includes(authorEmail) && replyBody && replyBody.match(replyBodyRegex)) {
        const matches = replyBody.matchAll(extractRegex);
        if (matches) {
          for (const match of matches) {
            if (match && match.length > 1) {
              Logger.log("FOUND MATCH! " + messageDate + ": " + match[1]);
              extractedData.push({ emailDate: messageDate, extractedString: match[1] });
            }
          }
        }
      }
    }
  }
  return extractedData;
}


// Example usage:
function testExtractStringsWithFilters() {
  const threadSubjectRegex = '"Beth Am TUESDAY Basketball:.*Possible open spots.*"';
  // This email is the final confirmation of which waitlist players are in for basketball tonight (7-9pm) at Temple Beth Am. We have 6 open spots.
  const replyBodyRegex = '.*This email is the final confirmation.*We have (\\d+) open spots.*';
  const extractRegex = '.*This email is the final confirmation.*We have (\\d+) open spots.*';

  const authorEmail = "ghirschhorn987@gmail.com";
  const startDate = new Date("2025/01/01");
  const endDate = new Date("2025/12/31");

  const results = extractStringsFromEmailsWithFilters(threadSubjectRegex, replyBodyRegex, extractRegex, authorEmail, startDate, endDate);
  Logger.log("Extracted data: " + JSON.stringify(results));
  return results;
}


function zzz_deleteSelectedSheets() {
  // //const tabNamePrefix = "Copy of";
  // //const tabNamePrefix = "Sun, Jun 2,";
  // // const tabNamePrefix = "Tue, Jul 2 -";
  // const tabNamePrefix = "Thur, Jul 4 -";

  // //const spreadsheetId = getRsvpSpreadsheetId("sunday");
  // //const spreadsheetId = getRsvpSpreadsheetId("tuesday");
  // const spreadsheetId = getRsvpSpreadsheetId("thursday");
  // //const spreadsheetId = "1jMg6KnfqpHDE-QPIJ5sdUBYDJ68Hkyb4VjllMXwlWTo";
  // //const spreadsheetId = "1znRh3_3vpJNJOK_8_8ccWWytgHt5PPhRh8lmiG3MPS0"; // Archived Sunday
  // //const spreadsheetId = "1GzV4s28qrUKyzU_6sIOCfEHr4cTMVsIDqdMHCI1GqU0"; // Archived Tuesday
  // //const spreadsheetId = "12SPoyayZxeKAs4U4p8PsRScGpgh2UnOHglNAyCQAO1M"; // Archived Thursday

  // const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  // var allSheets = spreadsheet.getSheets();
  // Logger.log("Found " + allSheets.length + " sheets in " + spreadsheet.getName());

  // // KEEP TWO OF THESE LINES AND COMMENT OUT OTHER TWO
  // //var shouldDeleteSheets = true;
  // //Logger.log("Deleting sheets BEFORE prefix = '" + tabNamePrefix + "'");
  // var shouldDeleteSheets = false;
  // Logger.log("Deleting sheets INCLUDING AND AFTER prefix = '" + tabNamePrefix + "'");

  // for (var i = 0; i < allSheets.length; i++) {
  //   var sheet = allSheets[i];
  //   var sheetName = sheet.getName();
  //   Logger.log("" + i + ": Sheet '" + sheetName + "'");

  //   if (sheetName.startsWith(tabNamePrefix)) {
  //     // KEEP TWO OF THESE LINES AND COMMENT OUT OTHER TWO
  //     //shouldDeleteSheets = false;
  //     //Logger.log("NO LONGER deleting all sheets starting at '" + sheetName + "'");
  //     shouldDeleteSheets = true;
  //     Logger.log("Deleting all sheets INCLUDING AND AFTER '" + sheetName + "'");
  //   }

  //   if (shouldDeleteSheets == true) {
  //     //spreadsheet.deleteSheet(sheet);
  //     //sheet.showSheet();
  //     //sheet.hideSheet();
  //     Logger.log("Deleted sheet '" + sheetName + "'");
  //   }
  // }
}

function test() {
  //USE_OVERRIDE_VALUES = true;
  USE_OVERRIDE_VALUES = false;

  var inResponsesMap = new Map();
  const outResponsesMap = new Map();
  const otherResponsesMap = new Map();

  var dayString = "sunday";
  addWaitlistEmailResponsesToMapsForDay(dayString, inResponsesMap, outResponsesMap, otherResponsesMap);

  Logger.log("==========================\r\nRESPONSE ORDER:\r\n" + arrayAsNumberedNewLineSeparatedString(Array.from(inResponsesMap.keys())) + "\r\n==========================");
  // for (i = 0; i < 100; i++) {
  //   testShuffleReplys(dayString);
  // }
}

function testDates() {
  var date = new Date(2023, 00, 07);
  Logger.log(getWaitlistEmailSubjectForDate(getDateAsString(date)));
  Logger.log(date);
  date = addDaysToDate(date, 10);
  Logger.log(date);
  Logger.log(getWaitlistEmailSubjectForDate(getDateAsString(date)));

}

function testGetWaitlistResponsesForDateRange() {
  // for all days {
  //   var inResponsesMap = new Map();
  //   const outResponsesMap = new Map();
  //   const otherResponsesMap = new Map();
  //   addWaitlistEmailResponsesToMapsForDay(dayString, inResponsesMap, outResponsesMap, otherResponsesMap);

  // //Logger.log("\r\nInitial IN:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMap.keys())));
  // //Logger.log("\r\nInitial OUT:\r\n" + arrayAsNewLineSeparatedString(Array.from(outResponsesMap.keys())));
  // //Logger.log("\r\nInitial OTHER:\r\n" + arrayAsNewLineSeparatedString(Array.from(otherResponsesMap.keys())));

  // Logger.log("==========================\r\nRESPONSE ORDER:\r\n" + arrayAsNumberedNewLineSeparatedString(Array.from(inResponsesMap.keys())) + "\r\n==========================");
  // }
}

function testShuffleReplys(dayString) {
  var inResponsesMap = new Map();
  const outResponsesMap = new Map();
  const otherResponsesMap = new Map();

  addWaitlistEmailResponsesToMapsForDay(dayString, inResponsesMap, outResponsesMap, otherResponsesMap);
  inResponsesMap = shuffleMap(inResponsesMap);

  //Logger.log("\r\nInitial IN:\r\n" + arrayAsNewLineSeparatedString(Array.from(inResponsesMap.keys())));
  //Logger.log("\r\nInitial OUT:\r\n" + arrayAsNewLineSeparatedString(Array.from(outResponsesMap.keys())));
  //Logger.log("\r\nInitial OTHER:\r\n" + arrayAsNewLineSeparatedString(Array.from(otherResponsesMap.keys())));

  Logger.log("==========================\r\nRANDOMIZED ORDER:\r\n" + arrayAsNumberedNewLineSeparatedString(Array.from(inResponsesMap.keys())) + "\r\n==========================");
}

function testNoGames() {
  Logger.log("==========================");

  testNoGamesLogging(new Date("2023-05-21 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-22 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-23 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-25 05:00 PDT"));
  Logger.log("==========================");
  testNoGamesLogging(new Date("2023-05-28 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-29 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-30 05:00 PDT"));
  testNoGamesLogging(new Date("2023-05-31 05:00 PDT"));
  testNoGamesLogging(new Date("2023-06-01 05:00 PDT"));
  testNoGamesLogging(new Date("2023-06-02 05:00 PDT"));
  testNoGamesLogging(new Date("2023-06-03 05:00 PDT"));
  Logger.log("==========================");
  testNoGamesLogging(new Date("2023-06-04 05:00 PDT"));
}

function testNoGamesLogging(currentDate) {
  Logger.log("==========================");
  Logger.log("currentDate=" + currentDate + ". isNoGameOnDate=" + isNoGameOnDate(currentDate));
  Logger.log("currentDate=" + currentDate + ". getDayStringToSendRosterEmails=" + getDayStringToSendRosterEmails(currentDate));
  Logger.log("currentDate=" + currentDate + ". getDayStringToSendWaitlistEmails=" + getDayStringToSendWaitlistEmails(currentDate));
}

function testDateString() {
  testDateStringLogging(new Date());

  testDateStringLogging(new Date("2023-01-08"));
  testDateStringLogging(new Date("2023-01-08 PDT"));
  testDateStringLogging(new Date("2023-01-08 00:00 PDT"));
  testDateStringLogging(new Date("2023-01-08 01:00 PDT"));
  testDateStringLogging(new Date("2023-01-08 02:00 PDT"));

  testDateStringLogging(new Date("2023-01-09"));
  testDateStringLogging(new Date("2023-01-09 PDT"));
  testDateStringLogging(new Date("2023-01-09 00:00 PDT"));
  testDateStringLogging(new Date("2023-01-09 01:00 PDT"));
  testDateStringLogging(new Date("2023-01-09 02:00 PDT"));
}

function testDateStringLogging(currentDate) {
  Logger.log("==========================");
  Logger.log("==========================");
  Logger.log("==========================");
  Logger.log("date=" + currentDate);
  const currentDayOfWeek = currentDate.getDay();
  const currentHourOfDay = currentDate.getHours();
  Logger.log("currentDayOfWeek=" + currentDayOfWeek);
  Logger.log("currentHourOfDay=" + currentHourOfDay);
  Logger.log("date.toDateString()=" + currentDate.toDateString());
  Logger.log("getDateAsString(date)=" + getDateAsString(currentDate));
}

function testGetWaitlistEmailThread() {
  const dayString = "thursday";

  //getWaitlistEmailThread("thursday");

  const subject = "\"" + getWaitlistEmailSubjectForDay(dayString) + "\"";
  const query = "from: " + GHIRSCHHORN_EMAIL + " subject: " + subject;
  const threads = GmailApp.search(query);

  if (threads.length != 1) {
    //    threads.forEach(function (thread) {
    for (const thread of threads) {
      Logger.log("Found email: " + thread.getFirstMessageSubject());
      Logger.log("thread id=" + thread.getId() + ", lastMessageDate=" + thread.getLastMessageDate());
      if (thread.getId() == "18733e4b6bf063cd") {
        Logger.log("RETURNING" + thread.getId());
        return thread;
      }
      //);
    }
    throw new Error("Unexpected number of email threads found. Expected 1 but found " + threads.length + ". Searched for '" + query + "'.");
  }
  return threads[0];
}

// ------------------ New small tests ------------------
// Simulate the randomized ordering: randomize primary list, then append randomized secondary list.
function simulateWaitlistOrdering() {
  const primary = [
    'alice@example.com',
    'bob@example.com',
    'carol@example.com',
    'dave@example.com'
  ];
  const secondary = [
    'xavier@example.com',
    'yvonne@example.com',
    'zach@example.com'
  ];

  // Create maps so we can reuse shuffleMap which expects a Map
  const primaryMap = new Map();
  primary.forEach(function (email, idx) { primaryMap.set(email, { idx: idx }); });
  const secondaryMap = new Map();
  secondary.forEach(function (email, idx) { secondaryMap.set(email, { idx: idx }); });

  const shuffledPrimary = shuffleMap(primaryMap);
  const shuffledSecondary = shuffleMap(secondaryMap);

  const finalOrder = [...Array.from(shuffledPrimary.keys()), ...Array.from(shuffledSecondary.keys())];

  Logger.log('Shuffled primary: ' + JSON.stringify(Array.from(shuffledPrimary.keys())));
  Logger.log('Shuffled secondary: ' + JSON.stringify(Array.from(shuffledSecondary.keys())));
  Logger.log('Final concatenated order: ' + JSON.stringify(finalOrder));
  return finalOrder;
}

// Simple unit test for shuffleMap to ensure keys are preserved and order randomized.
function testShuffleMapUnit() {
  const map = new Map();
  for (let i = 1; i <= 10; i++) {
    map.set('user' + i + '@example.com', i);
  }
  const before = Array.from(map.keys());
  const after = Array.from(shuffleMap(map).keys());

  Logger.log('Before shuffle: ' + JSON.stringify(before));
  Logger.log('After shuffle:  ' + JSON.stringify(after));

  // Basic checks
  if (before.length !== after.length) {
    throw new Error('shuffleMap changed key count');
  }
  const missing = before.filter(x => !after.includes(x));
  if (missing.length > 0) {
    throw new Error('shuffleMap dropped keys: ' + missing);
  }

  return { before: before, after: after };
}


function testRosterCountsPerPlayer() {
  const emails = getRosterGroupEmails(dayString);
}

function testSignupCounts() {
  let playerToGameCount = new Map();

  let rangeName = RSVP_CELLS_IN_GAME_RANGE;
  testSignupCountsRangeNameAndDay(rangeName, "tuesday", playerToGameCount);
  testSignupCountsRangeNameAndDay(rangeName, "thursday", playerToGameCount);
  testSignupCountsRangeNameAndDay(rangeName, "sunday", playerToGameCount);
  rangeName = RSVP_CELLS_WAITLIST_RANGE;
  testSignupCountsRangeNameAndDay(rangeName, "tuesday", playerToGameCount);
  testSignupCountsRangeNameAndDay(rangeName, "thursday", playerToGameCount);
  testSignupCountsRangeNameAndDay(rangeName, "sunday", playerToGameCount);

  playerToGameCount.forEach(function (value, key) {
    Logger.log("player=" + key + " gameCount=" + value);
  })
}

function testDeleteAccidentalCopiesOfSpreadsheets() {
  const dayString = "tuesday";
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));

  const sheets = spreadsheet.getSheets();
  Logger.log("sheets for day " + dayString + ". length=" + sheets.length);
  for (const sheet of sheets) {
    Logger.log("sheets name:" + sheet.getName());
    if (sheet.getName().startsWith("Copy of Tue, Feb 18, 8-10pm")) {
      Logger.log("DELETING " + sheet.getName());
      spreadsheet.deleteSheet(sheet);
    }

  }
}

function testSignupCountsRangeNameAndDay(rangeName, dayString, playerStringToGameCount) {
  const spreadsheet = SpreadsheetApp.openById(getRsvpSpreadsheetId(dayString));

  const sheets = spreadsheet.getSheets();
  Logger.log("sheets for day " + dayString + ". length=" + sheets.length);
  for (const sheet of sheets) {
    // Logger.log("sheets name:" + sheet.getName());
    if (getMonthNumberFromRsvpTabName(sheet.getName()) < 6) {
      // Logger.log("Ignoring sheet prior to July. Sheet name=" + sheet.getName());
    } else {
      const range = sheet.getRange(rangeName);
      const playerStrings = getPlayerSetFromRange(range);
      Logger.log("Week=" + sheet.getName() + ", range=" + rangeName + ", playerCount=" + playerStrings.size);
      for (let playerString of playerStrings) {
        playerString = normalizePlayerString(playerString);
        playerString = getEmailFromPlayerString(playerString);
        let count = playerStringToGameCount.get(playerString);
        //Logger.log("player=" + player + " oldCount=" + count);
        if (count == null) {
          count = 0;
        }
        count = count + 1;
        playerStringToGameCount.set(playerString, count);
        //Logger.log("player=" + player + " newGameCount=" + count);
      }
    }
  }
}

function testReplyParsing() {
  const subject = "\"Beth Am THURSDAY Basketball: Possible open spots for tonight, Oct 6, 8-10pm\"";
  //const subject = "\"Re: Beth Am SUNDAY Basketball: Possible open spots for tonight, Nov 6, 7-9pm\"";
  //const subject = "\"Beth Am TUESDAY Basketball: Possible open spots for tonight, Nov 1, 8-10pm\"";

  const query = "from: " + GHIRSCHHORN_EMAIL + " subject: " + subject;
  const threads = GmailApp.search(query);
  if (threads.length != 1) {
    threads.forEach(function (thread) {
      Logger.log("Found email: " + thread.getFirstMessageSubject());
    });
    throw new Error("Unexpected number of email threads found. Expected 1 but found " + threads.length + ". Searched for '" + query + "'.");
  }
  const messages = threads[0].getMessages();
  // testReplyParsingForType(messages, "EQUALITY");
  testReplyParsingForType(messages, "IN GAME");
  testReplyParsingForType(messages, "OUT OF GAME");
  testReplyParsingForType(messages, "OTHER");
}

function testReplyParsingForType(messages, type) {
  Logger.log(type);
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var plainBody = msg.getPlainBody();
    var player = normalizePlayerString(msg.getFrom());

    if (type == "EQUALITY") {
      var trunctatedBody = msg.getBody().toLowerCase().substring(0, 80)
      var truncatedPlainBody = plainBody.toLowerCase().substring(0, 80);
      if (trunctatedBody == truncatedPlainBody) {
        Logger.log("Player is equal: " + player);
      } else {
        Logger.log("Player is not equal: " + player);
        Logger.log("  body.toLowerCase().substring(0,50): " + trunctatedBody);
        Logger.log("  plainBody.toLowerCase().substring(0,50): " + truncatedPlainBody);
      }
    }

    if (
      (type == "IN GAME" && isInGameReply(plainBody))
      || (type == "OUT OF GAME" && isOutOfGameReply(plainBody))
      || (type == "OTHER" && !isInGameReply(plainBody) && !isOutOfGameReply(plainBody))
    ) {
      Logger.log(msg.getDate() + ": " + player);
      // if (player.indexOf("ghirschhorn987") != -1) {
      //   Logger.log("  plainBody.toLowerCase().substring(0,50): " + plainBody.toLowerCase().substring(0, 50));
      //   Logger.log("  body.toLowerCase().substring(0,50): " + msg.getBody().toLowerCase().substring(0, 50));
      //   Logger.log("  plainBody: " + plainBody);
      //   Logger.log("  body: " + msg.getBody());
      // }
    }
  }
}

function testDay(dayString) {
  Logger.log("START TESTING day: " + dayString);
  //prepareRsvpSpreadsheetForDay(dayString);
  //createAndSendRosterEmailForDay(dayString);
  //createAndSendWaitlistEmailForDay(dayString);
  Logger.log("\n=================================\n Starting Open spots: " + getOpenSpotCount(dayString));
  replyInitialToWaitlistEmailResponsesForDay(dayString);
  Logger.log("\n=================================\n After Waitlist Open spots: " + getOpenSpotCount(dayString));
  replyFinalToWaitlistEmailResponsesForDay(dayString);
  Logger.log("\n=================================\n Final Waitlist Open spots: " + getOpenSpotCount(dayString));
  Logger.log("END TESTING day: " + dayString);
}

function testConstants() {
  USE_OVERRIDE_VALUES = true;
  Logger.log(getWaitlistEmailSubjectForDay("thursday"));
  Logger.log(getWaitlistEmailSubjectForDay("sunday"));
  Logger.log(getRsvpSpreadsheetId("thursday"));
  Logger.log(getRsvpSpreadsheetId("sunday"));
  Logger.log(OVERRIDE_EMAIL_RECIPIENT_LIST);

  USE_OVERRIDE_VALUES = false;
  Logger.log(getWaitlistEmailSubjectForDay("thursday"));
  Logger.log(getWaitlistEmailSubjectForDay("sunday"));
  Logger.log(getRsvpSpreadsheetId("thursday"));
  Logger.log(getRsvpSpreadsheetId("sunday"));
  Logger.log(OVERRIDE_EMAIL_RECIPIENT_LIST);
}

function testGetEmailFromPlayer() {
  Logger.log(getNameFromPlayerString("aaa"));
  Logger.log(getEmailFromPlayerString("aaa"));
  Logger.log(getNameFromPlayerString("aaa@gmail.com"));
  Logger.log(getEmailFromPlayerString("aaa@gmail.com"));
  Logger.log(getNameFromPlayerString("AAA <aaa@gmail.com>"));
  Logger.log(getEmailFromPlayerString("AAA <aaa@gmail.com>"));
  Logger.log(getNameFromPlayerString("AAA <aaa+canned-repsonse@gmail.com>"));
  Logger.log(getEmailFromPlayerString("AAA <aaa+canned-repsonse@gmail.com>"));
  Logger.log(getNameFromPlayerString("AAA <aaa+canned-repsonse@yahoo.com>"));
  Logger.log(getEmailFromPlayerString("AAA <aaa+canned-repsonse@yahoo.com>"));
}

function testArray() {
  const map = new Map();
  map.set("a", 1);
  map.set("b", 2);
  Logger.log(map.keys());
  const array = Array.from(map.keys());
  Logger.log(array);
  array.forEach(function (value) {
    Logger.log(value);
  });
}

function testForward() {
  const dayString = "thursday";
  const thread = getWaitlistEmailThread(dayString);
  const messages = thread.getMessages();

  Logger.log("messages length=" + messages.length);
  var lastUndeletedMessage;
  for (var message of messages) {
    Logger.log("from" + message.getFrom() + " is in trash: " + message.isInTrash());
    if (!message.isInTrash()) {
      lastUndeletedMessage = message;
    }
  }

  const htmlBody =
    "TESTING FORWARDING<br><br>"
    + "<br><br>"
    + "<br>---------- Forwarded message ---------"
    + "<br>From: " + encodeHtml(message.getFrom())
    + "<br>Date: " + message.getDate()
    + "<br>Subject: " + encodeHtml(message.getSubject())
    + "<br><br>"
    + lastUndeletedMessage.getBody();
  const options = { htmlBody: htmlBody };
  Logger.log(htmlBody);
  lastUndeletedMessage.forward(GHIRSCHHORN_EMAIL, options);

}

function testShuffleArray() {
  const array = ["aaa", "bbb", "ccc", "ddd", "eee"];
  Logger.log("array=" + array);
  shuffleArrayInPlace(array);
  Logger.log("shuffled = " + array);
  shuffleArrayInPlace(array);
  Logger.log("shuffled = " + array);
  shuffleArrayInPlace(array);
  Logger.log("shuffled = " + array);
}


function testShuffleMap() {
  const map = new Map();
  map.set("aaa", 111);
  map.set("bbb", 222);
  map.set("ccc", 333);
  map.set("ddd", 444);
  map.set("eee", 555);
  Logger.log("map=" + [...map.entries()]);
  var shuffledMap = shuffleMap(map);
  Logger.log("shuffled = " + [...shuffledMap.entries()]);
  shuffledMap = shuffleMap(map);
  Logger.log("shuffled = " + [...shuffledMap.entries()]);
  shuffledMap = shuffleMap(map);
  Logger.log("shuffled = " + [...shuffledMap.entries()]);
}

function thisThisEmailIsTheFinalConfirmation() {
  const content = "\"This email is the final confirmation of which waitlist players are in for basketball tonight\"";
  const query = "from: " + GHIRSCHHORN_EMAIL + content;
  const threads = GmailApp.search(query);
  Logger.log("thread count: " + threads.length);

  threads.forEach(function (thread) {
    const messages = thread.getMessages();
    messages.forEach(function (message) {
      if (message.getPlainBody().indexOf("This email is the final confirmation of which waitlist players are in for basketball tonight") != -1) {
        Logger.log(message.getDate() + ": " + message.getPlainBody());
      }
    })
  })
}






