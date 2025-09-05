// This file will hold unit tests.

function runAllTests() {
  Logger.log("Starting test suite...");

  testGetRosterMap();
  testGetMainRosterPlayers();
  testGetSecondaryReserveRosterPlayers();
  testCreateAndSendWaitlistEmailForDay();
  testGetWaitlistGroupEmails();

  Logger.log("Test suite finished.");
}

function testGetRosterMap() {
  // Mock SpreadsheetApp
  const originalSpreadsheetApp = SpreadsheetApp;
  try {
    SpreadsheetApp = {
      openById: function (id) {
        return {
          getRangeByName: function (name) {
            return {
              getValues: function () {
                return [
                  ["player1 <email1@a.com>", "Main"],
                  ["player2 <email2@b.com>", "SecondaryReserve"],
                  ["player3 <email3@c.com>", "Main"],
                  ["", ""],
                  ["player4 <email4@d.com>", ""],
                  ["player5 <email5@e.com>", "SecondaryReserve"],
                  ["player6 <email6@f.com>", "Main"],
                  ["emailonly@g.com", "Main"],
                ["emailonly@g.com", "Main"]
                ];
              }
            };
          }
        };
      }
    };

    const rosterMap = getRosterMap();

    // Assertions
    const mainPlayers = rosterMap[PLAYER_TYPE_MAIN];
    const secondaryPlayers = rosterMap[PLAYER_TYPE_SECONDARY_RESERVE];

    if (!mainPlayers || mainPlayers.length !== 4) {
      Logger.log("Test Failed: Expected 4 main players, but found " + (mainPlayers ? mainPlayers.length : 0));
    } else {
      Logger.log("Test Passed: Correct number of main players.");
    }

    if (!secondaryPlayers || secondaryPlayers.length !== 2) {
      Logger.log("Test Failed: Expected 2 secondary players, but found " + (secondaryPlayers ? secondaryPlayers.length : 0));
    } else {
      Logger.log("Test Passed: Correct number of secondary players.");
    }

    const expectedMain = ["player1 <email1@a.com>", "player3 <email3@c.com>", "player6 <email6@f.com>", "emailonly@g.com"];
    if (JSON.stringify(mainPlayers) !== JSON.stringify(expectedMain)) {
      Logger.log("Test Failed: Main player list does not match expected.");
      Logger.log("Expected: " + JSON.stringify(expectedMain));
      Logger.log("Got: " + JSON.stringify(mainPlayers));
    } else {
      Logger.log("Test Passed: Main player list is correct.");
    }
  } finally {
    // Restore original SpreadsheetApp
    SpreadsheetApp = originalSpreadsheetApp;
  }
}

function testGetMainRosterPlayers() {
  Logger.log("Running test: testGetMainRosterPlayers...");
  const rosterMap = {
    "Main": ["player1", "player2"],
    "SecondaryReserve": ["player3"]
  };

  const mainPlayers = getMainRosterPlayers(rosterMap);

  if (mainPlayers.length !== 2 || mainPlayers[0] !== "player1" || mainPlayers[1] !== "player2") {
    Logger.log("Test Failed: getMainRosterPlayers did not return the correct players.");
  } else {
    Logger.log("Test Passed: getMainRosterPlayers works as expected.");
  }
}

function testGetSecondaryReserveRosterPlayers() {
  Logger.log("Running test: testGetSecondaryReserveRosterPlayers...");
  const rosterMap = {
    "Main": ["player1", "player2"],
    "SecondaryReserve": ["player3"]
  };

  const secondaryReservePlayers = getSecondaryReserveRosterPlayers(rosterMap);

  if (secondaryReservePlayers.length !== 1 || secondaryReservePlayers[0] !== "player3") {
    Logger.log("Test Failed: getSecondaryReserveRosterPlayers did not return the correct players.");
  } else {
    Logger.log("Test Passed: getSecondaryReserveRosterPlayers works as expected.");
  }
}

function testCreateAndSendWaitlistEmailForDay() {
  Logger.log("Running test: testCreateAndSendWaitlistEmailForDay...");

  // Mock dependencies
  const originalSendEmail = sendEmail;
  const originalGetWaitlistGroupEmails = getWaitlistGroupEmails;
  const originalGetWaitlistEmailSubjectForDay = getWaitlistEmailSubjectForDay;
  const originalGetWaitlistEmailBody = getWaitlistEmailBody;

  let emailSent = false;
  let sentTo, sentSubject, sentBody, sentHtmlBody;

  try {
    // Replace functions with mocks
    sendEmail = function (to, subject, body, htmlBody) {
      emailSent = true;
      sentTo = to;
      sentSubject = subject;
      sentBody = body;
      sentHtmlBody = htmlBody;
    };

    getWaitlistGroupEmails = function (dayString) {
      return "test@example.com";
    };

    getWaitlistEmailSubjectForDay = function (dayString) {
      return "Test Subject";
    };

    getWaitlistEmailBody = function (dayString, useHtml) {
      return useHtml ? "<p>Test HTML Body</p>" : "Test Body";
    };

    // Run the function
    createAndSendWaitlistEmailForDay("tuesday");

    // Assertions
    if (!emailSent) {
      Logger.log("Test Failed: Email was not sent.");
    } else {
      Logger.log("Test Passed: Email was sent.");
    }

    if (sentTo !== "test@example.com") {
      Logger.log("Test Failed: Email sent to wrong address. Expected: test@example.com, Got: " + sentTo);
    } else {
      Logger.log("Test Passed: Email sent to correct address.");
    }

    if (sentSubject !== "Test Subject") {
      Logger.log("Test Failed: Email subject is wrong. Expected: Test Subject, Got: " + sentSubject);
    } else {
      Logger.log("Test Passed: Email subject is correct.");
    }
  } finally {
    // Restore original functions
    sendEmail = originalSendEmail;
    getWaitlistGroupEmails = originalGetWaitlistGroupEmails;
    getWaitlistEmailSubjectForDay = originalGetWaitlistEmailSubjectForDay;
    getWaitlistEmailBody = originalGetWaitlistEmailBody;
  }
}

function testGetWaitlistGroupEmails() {
  Logger.log("Running test: testGetWaitlistGroupEmails...");

  // Mock dependencies
  const originalGetPrimaryWaitlistEmails = getPrimaryWaitlistEmails;
  const originalGetSecondaryWaitlistEmails = getSecondaryWaitlistEmails;

  try {
    getPrimaryWaitlistEmails = function (dayString) {
      return ["primary1@example.com", "primary2@example.com"];
    };

    getSecondaryWaitlistEmails = function (dayString) {
      return ["secondary1@example.com"];
    };

    // Run the function
    const waitlistEmails = getWaitlistGroupEmails("tuesday");

    // Assertions
    const expectedEmails = "primary1@example.com,primary2@example.com,secondary1@example.com," + EMAIL_GROUP_ADMINS;
    const expectedEmailsWithSpaces = ["primary1@example.com", "primary2@example.com", "secondary1@example.com", EMAIL_GROUP_ADMINS].join(", ");

    if (waitlistEmails !== expectedEmailsWithSpaces) {
      Logger.log("Test Failed: getWaitlistGroupEmails returned incorrect emails.");
      Logger.log("Expected: " + expectedEmailsWithSpaces);
      Logger.log("Got: " + waitlistEmails);
    } else {
      Logger.log("Test Passed: getWaitlistGroupEmails works as expected.");
    }
  } finally {
    // Restore original functions
    getPrimaryWaitlistEmails = originalGetPrimaryWaitlistEmails;
    getSecondaryWaitlistEmails = originalGetSecondaryWaitlistEmails;
  }
}
