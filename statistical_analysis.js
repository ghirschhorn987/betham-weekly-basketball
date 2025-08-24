var totalDateCount = 0;
var noThreadCount = 0;
var multipleThreadCount = 0;
var noMessageCount = 0;
var multipleMessageCount = 0;
var noReplyCount = 0;

const GMAIL_SEARCH_QUERY_DATE_RANGE = " after:2023-01-01 before:2023-07-01";
const WAITLIST_FINAL_CONFIRMATION_STRING = "This email is the final confirmation";

function logStats() {
  var startDate = new Date(2023, 00, 00);
  var endDate = new Date(2023, 05, 31);
  logStatsForDateRange(startDate, endDate);
}

function logStatsForDateRange(startDate, endDate) {
  Logger.log("startDate=" + startDate + ", endDate=" + endDate);
  var date = startDate;
  while (date <= endDate) {
    logStatsForDate(date);
    date = addDaysToDate(date, 1);
  }

  var oneThreadCount = totalDateCount - noThreadCount - multipleThreadCount;
  var oneMessageCount = oneThreadCount + multipleThreadCount - noMessageCount - multipleMessageCount;
  var oneReplyCount = oneMessageCount + multipleMessageCount - noReplyCount;
  Logger.log("totalDateCount = " + totalDateCount);
  Logger.log("noThreadCount = " + noThreadCount);
  Logger.log("oneThreadCount = " + oneThreadCount);
  Logger.log("multipleThreadCount = " + multipleThreadCount);
  Logger.log("noMessageCount = " + noMessageCount);
  Logger.log("oneMessageCount = " + oneMessageCount);
  Logger.log("multipleMessageCount = " + multipleMessageCount);
  Logger.log("noReplyCount = " + noReplyCount);
  Logger.log("oneReplyCount = " + oneReplyCount);
}

function logStatsForDate(date) {
  totalDateCount++;
  // Logger.log(getDateAsDay + ", " + date + ": Logging stats.");

  const subject = "\"" + getWaitlistEmailSubjectForDate(date) + "\"";
  const query = "from: " + GHIRSCHHORN_EMAIL + " " + GMAIL_SEARCH_QUERY_DATE_RANGE + " subject: " + subject + " \"" + WAITLIST_FINAL_CONFIRMATION_STRING + "\"";
  const threads = getEmailThreadsForSearchQuery(query);

  if (threads.length < 1) {
    noThreadCount++;
    // No emails found -- probably due to no game.
    // Logger.log("!!!!! " + date + ": FOUND NO THREADS: " + threads.length + ".   (Probably no game that night.)";
    return;
  }

  if (threads.length > 1) {
    Logger.log("!!!!! " + date + ": FOUND MULTILPLE THREADS: " + threads.length);
    multipleThreadCount++;
    return;
  }

  var allMessages = getAllMessages(threads);
  var finalReplyMessages = getFinalReplyMessages(allMessages);

  if (finalReplyMessages.length < 1) {
    noMessageCount++;
    Logger.log("!!!!! " + date + ": NO FINAL REPLY MESSAGES FOUND. Expected 1. In " + threads.length + " threads and " + allMessages.length + " messages. Searched for '" + query + "'.");
  } else if (finalReplyMessages.length > 1) {
    multipleMessageCount++;
    Logger.log("!!!!! " + date + ": UNEXPECTED NUMBER OF FINAL REPLY MESSAGES FOUND. Expected 1 but found " + finalReplyMessages.length() + ". In " + threads.length + " threads and " + allMessages.length + " messages. Searched for '" + query + "'.");
  } else {
    const messageBody = finalReplyMessages[0].getBody();
    const playersInGame = /These players are in:([\s|\S]+?)These players are next up/.exec(messageBody);
    const playersUpNext = /These players are next up if someone drops out:([\s|\S]+?)If you have replied/.exec(messageBody);

    if (playersInGame == null || playersUpNext == null) {
      noReplyCount++;
      Logger.log("!!!!! " + date + ": NO FINAL REPLY TEXT FOUND IN FINAL REPLY MESSAGE BODY. Message body: \n" + messageBody);
    } else {
      Logger.log("" + date + ", Players In Game:\n" + decodeHtml(htmlItemizedListStringAsNewLineSeparatedString(playersInGame[1])));
      Logger.log("" + date + ", Players Up Next:\n" + decodeHtml(htmlItemizedListStringAsNewLineSeparatedString(playersUpNext[1])));
    }
  }
}

function getAllMessages(threads) {
  const allMessages = [];
  for (const thread of threads) {
    for (const message of thread.getMessages()) {
      allMessages.push(message);
    }
  }
  return allMessages;
}

function getFinalReplyMessages(messages) {
  const finalReplyMessages = [];
  for (const msg of messages) {
    if (msg.getFrom() == GHIRSCHHORN_EMAIL && msg.getBody().includes(WAITLIST_FINAL_CONFIRMATION_STRING)) {
      //if (msg.getBody().includes(WAITLIST_FINAL_CONFIRMATION_STRING)) {
      finalReplyMessages.push(msg);
    }
  }
  return finalReplyMessages;
}