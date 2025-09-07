//========================================
// Generic utility functions - email
//========================================
function sendEmail(emailAddressesAsString, subject, body, htmlBody) {
  if (USE_OVERRIDE_VALUES) {
    body = "TESTING EMAIL ONLY!!! Would have been sent to " + emailAddressesAsString +
      "\n\n" + body;
    htmlBody = "TESTING EMAIL ONLY!!! Would have been sent to " + encodeHtml(emailAddressesAsString) +
      "<br><br>" + htmlBody;
    emailAddressesAsString = OVERRIDE_EMAIL_RECIPIENT_LIST;
  }

  Logger.log("Sending email to: " + emailAddressesAsString);
  Logger.log("Email subject: " + subject);

  if (USE_OVERRIDE_VALUES && OVERRIDE_LOG_EMAIL_INSTEAD_OF_SENDING) {
    Logger.log("Logging email instead of sending it.");
    Logger.log("Body: " + htmlBody);
  } else {
    GmailApp.sendEmail(emailAddressesAsString, subject, body, { htmlBody: htmlBody });
  }
}

function forwardEmail(thread, emailAddressesAsString, additionalHtmlBody, firstOrLast) {
  if (USE_OVERRIDE_VALUES) {
    additionalHtmlBody = "TESTING EMAIL ONLY!!! Would have been sent to " + encodeHtml(emailAddressesAsString) +
      "<br><br>" + additionalHtmlBody;
    emailAddressesAsString = OVERRIDE_EMAIL_RECIPIENT_LIST;
  }

  Logger.log("Forwarding email to: " + emailAddressesAsString);
  Logger.log("Email subject: " + thread.getFirstMessageSubject());

  const messages = thread.getMessages();
  Logger.log("messages length=" + messages.length);
  const undeletedMessages = [];
  for (var message of messages) {
    if (!message.isInTrash()) {
      undeletedMessages.push(message);
    }
  }
  var messageToForward;
  if (firstOrLast === "first") {
    messageToForward = undeletedMessages[0];
  } else if (firstOrLast === "last") {
    messageToForward = undeletedMessages[undeletedMessages.length - 1];
  } else {
    throw new Error("Unexpected value for firstOrLast. Excpected 'first' or 'last' but got '" + firstOrLast + "'.");
  }

  const previousMessagesAsHtml =
    "<br><br>"
    + "<br>---------- Forwarded message ---------"
    + "<br>From: " + encodeHtml(messageToForward.getFrom())
    + "<br>Date: " + messageToForward.getDate()
    + "<br>Subject: " + encodeHtml(messageToForward.getSubject())
    + "<br>To: " + encodeHtml(messageToForward.getTo())
    + "<br>Cc: " + encodeHtml(messageToForward.getCc())
    + "<br><br>"
    + messageToForward.getBody();

  if (USE_OVERRIDE_VALUES && OVERRIDE_LOG_EMAIL_INSTEAD_OF_SENDING) {
    Logger.log("Logging email instead of sending it.");
    Logger.log("Body: " + additionalHtmlBody + previousMessagesAsHtml);
  } else {
    messageToForward.forward(emailAddressesAsString, { htmlBody: additionalHtmlBody + previousMessagesAsHtml, cc: messageToForward.getCc() });
  }
}

//========================================
// Generic utility functions - spreadsheets
//========================================
function getSpreadsheetRangeValuesAsArray(spreadsheetRange) {
  nonEmptyValues = [];
  var displayValues = spreadsheetRange.getDisplayValues();
  for (var row in displayValues) {
    for (var col in displayValues[row]) {
      var displayValue = displayValues[row][col];
      if (displayValue != "") {
        nonEmptyValues.push(displayValue);
      }
    }
  }
  return nonEmptyValues;
}

function addValuesArrayToSpreadsheetRange(range, valuesToAddArray, skipNonBlankCells) {
  const valuesAdded = [];
  var startRow = 1;
  valuesToAddArray.forEach(function (valueToAdd, index) {
    for (row = startRow; row <= range.getHeight(); row++) {
      const cell = range.getCell(row, 1);
      if (cell.isBlank() || !skipNonBlankCells) {
        cell.setValue(valueToAdd);
        valuesAdded.push(valueToAdd);
        break;
      }
    }
    startRow = row + 1;
  });

  if (valuesAdded.length < valuesToAddArray.length) {
    throw new Error("Aborting because could not add all values to range. Tried to add " + valuesToAddArray.length + " values but only added " + valuesAdded.length + ". Spreadsheet may be partially updated.");
  }

  return valuesAdded;
}

//========================================
// Generic utility functions - javascript
//========================================
function removeFromArray(sourceArray, itemsToRemoveArray) {
  return sourceArray
    .filter(item => !itemsToRemoveArray.includes(item));
}

function removeDuplicatesFromArray(sourceArray) {
  return [...new Set(sourceArray)]
}

// Based on answer here: https://stackoverflow.com/a/12646864/279029
function shuffleArrayInPlace(array) {
  for (var i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffleSet(sourceSet) {
  const tempArray = Array.from(sourceSet);
  shuffleArrayInPlace(tempArray);
  return new Set(tempArray);
}

function shuffleMap(sourceMap) {
  const shuffledMap = new Map();
  var shuffledKeys = Array.from(sourceMap.keys());
  shuffleArrayInPlace(shuffledKeys);
  shuffledKeys.forEach(function (key) {
    shuffledMap.set(key, sourceMap.get(key));
  });
  return shuffledMap;
}

//========================================
// Generic utility functions - string formatting
//========================================
function arrayAsNewLineSeparatedString(sourceArray) {
  var list = "";
  sourceArray.forEach(function (item, index) {
    list += "- " + item + "\r\n";
  });
  return list;
}

function arrayAsNumberedNewLineSeparatedString(sourceArray) {
  var list = "";
  var position = 0;
  sourceArray.forEach(function (item, index) {
    position++;
    list += "" + position + ": " + item + "\r\n";
  });
  return list;
}

function arrayAsHtmlItemizedList(sourceArray) {
  var list = "<ol>";
  sourceArray.forEach(function (item, index) {
    list += "<li>" + encodeHtml(item) + "</li>";
  });
  list += "</ol>";
  return list;
}

function htmlItemizedListStringAsNewLineSeparatedString(htmlListString) {
  var newLineSeparatedString = htmlListString;
  newLineSeparatedString = newLineSeparatedString.replace(/<ol>/g, '\r\n');
  newLineSeparatedString = newLineSeparatedString.replace(/<\/ol>/g, '');
  newLineSeparatedString = newLineSeparatedString.replace(/<li>/g, '\r\n');
  newLineSeparatedString = newLineSeparatedString.replace(/<\/li>/g, '');
  return newLineSeparatedString;
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function encodeHtml(input) {
  input = input.replace(/&/g, '&amp;');
  input = input.replace(/</g, '&lt;');
  input = input.replace(/>/g, '&gt;');
  return input;
}

function decodeHtml(input) {
  input = input.replace(/<p>/g, '\r\n');
  input = input.replace(/&amp;/g, '&');
  input = input.replace(/&lt;/g, '<');
  input = input.replace(/&gt;/g, '>');
  return input;
}

//========================================
// Generic utility functions - dates
//========================================
// Return next occurence of a given day.
// If target day is same day of week as today, return today (not next week's day).
function getDateForNextOccurrenceOfDay(targetDayString) {
  var date = new Date();
  const currentDayOfWeek = date.getDay();
  const targetDayAsNumber = getDayStringAsNumber(targetDayString);

  // Adding 7 and then mod by 7 handles wrap around that causes diff to be negative number
  // (e.g. when desired day is next week but on earlier day than today)
  const offset = (targetDayAsNumber - currentDayOfWeek + 7) % 7;

  date.setDate(date.getDate() + offset);
  return date;
}

// Return previous occurence of a given day.
// If target day is same day of week as today, return previous week's day (not today).
function getDateForPreviousOccurrenceOfDayString(targetDayString) {
  const nextDate = getDateForNextOccurrenceOfDay(targetDayString);
  const prevDate = addDaysToDate(nextDate, -7);
  return prevDate;
}

function getDayStringAsNumber(dayString) {
  switch (dayString) {
    case "sunday": return 0;
    case "tuesday": return 2;
    case "thursday": return 4;
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getDateAsDayString(date) {
  var dateObject = new Date(date);
  Logger.log("getDateAsDayString: date=" + date);
  Logger.log("getDateAsDayString: dateObject=" + dateObject);
  Logger.log("getDateAsDayString: date.getDate()=" + date.getDay());
  Logger.log("getDateAsDayString: dateObject.getDate()=" + dateObject.getDay());

  switch (dateObject.getDay()) {
    case 0: return "sunday";
    case 1: return "monday";
    case 2: return "tuesday";
    case 3: return "wednesday";
    case 4: return "thursday";
    case 5: return "friday";
    case 6: return "saturday";
    default: throw new Error("Unknown dateObject.day '" + dateObject.getDay() + "' for date: " + dateObject);
  }
}

function getShortDayName(dayString) {
  switch (dayString) {
    case "sunday": return "Sun";
    case "tuesday": return "Tue";
    case "thursday": return "Thur";
    default: throw new Error("Unknown day: " + dayString);
  }
}

function getDateAsString(date) {
  return date.toLocaleString("en-us", { month: 'short', day: 'numeric' });
}

function addDaysToDate(date, days) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}
