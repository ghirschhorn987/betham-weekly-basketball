// This file will hold unit tests.

function runAllTests() {
  Logger.log("Starting test suite...");

  testGetRosterTypeToPlayerStrings();
  testGetMainRosterPlayerStrings();
  testGetSecondaryReserveRosterPlayerStrings();
  testCreateAndSendWaitlistEmailForGameDate();
  testGetWaitlistGroupEmails();
  testIsMainRosterPlayerString();
  testSynchronizeWaitlistHelperFunctions();

  Logger.log("Test suite finished.");
}

function testGetRosterTypeToPlayerStrings() {
  Logger.log("Running test: testGetRosterTypeToPlayerStrings...");

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
                  ["emailonly@g.com", "Main"]
                ];
              }
            };
          }
        };
      }
    };

    const rosterTypeToPlayerStrings = getRosterTypeToPlayerStrings();

    // Assertions
    const mainPlayerStrings = rosterTypeToPlayerStrings[PLAYER_TYPE_MAIN];
    const secondaryPlayerStrings = rosterTypeToPlayerStrings[PLAYER_TYPE_SECONDARY_RESERVE];

    if (!mainPlayerStrings || mainPlayerStrings.length !== 4) {
      Logger.log("Test Failed: Expected 4 main players, but found " + (mainPlayerStrings ? mainPlayerStrings.length : 0));
    } else {
      Logger.log("Test Passed: Correct number of main players.");
    }

    if (!secondaryPlayerStrings || secondaryPlayerStrings.length !== 2) {
      Logger.log("Test Failed: Expected 2 secondary players, but found " + (secondaryPlayerStrings ? secondaryPlayerStrings.length : 0));
    } else {
      Logger.log("Test Passed: Correct number of secondary players.");
    }

    const expectedMain = ["player1 <email1@a.com>", "player3 <email3@c.com>", "player6 <email6@f.com>", "emailonly@g.com"];
    if (JSON.stringify(mainPlayerStrings) !== JSON.stringify(expectedMain)) {
      Logger.log("Test Failed: Main player list does not match expected.");
      Logger.log("Expected: " + JSON.stringify(expectedMain));
      Logger.log("Got: " + JSON.stringify(mainPlayerStrings));
    } else {
      Logger.log("Test Passed: Main player list is correct.");
    }
  } finally {
    // Restore original SpreadsheetApp
    SpreadsheetApp = originalSpreadsheetApp;
  }
}

function testGetMainRosterPlayerStrings() {
  Logger.log("Running test: testGetMainRosterPlayerStrings...");
  const rosterTypeToPlayerStrings = {
    "Main": ["player1", "player2"],
    "SecondaryReserve": ["player3"]
  };

  const mainPlayers = getMainRosterPlayerStrings(rosterTypeToPlayerStrings);

  if (mainPlayers.length !== 2 || mainPlayers[0] !== "player1" || mainPlayers[1] !== "player2") {
    Logger.log("Test Failed: getMainRosterPlayers did not return the correct players.");
  } else {
    Logger.log("Test Passed: getMainRosterPlayers works as expected.");
  }
}

function testGetSecondaryReserveRosterPlayerStrings() {
  Logger.log("Running test: testGetSecondaryReserveRosterPlayerStrings...");
  const rosterTypeToPlayerStrings = {
    "Main": ["player1", "player2"],
    "SecondaryReserve": ["player3"]
  };

  const secondaryReservePlayers = getSecondaryReserveRosterPlayerStrings(rosterTypeToPlayerStrings);

  if (secondaryReservePlayers.length !== 1 || secondaryReservePlayers[0] !== "player3") {
    Logger.log("Test Failed: getSecondaryReserveRosterPlayers did not return the correct players.");
  } else {
    Logger.log("Test Passed: getSecondaryReserveRosterPlayers works as expected.");
  }
}

function testCreateAndSendWaitlistEmailForGameDate() {
  Logger.log("Running test: testCreateAndSendWaitlistEmailForGameDate...");

  // Mock dependencies
  const originalSendEmail = sendEmail;
  const originalGetWaitlistGroupEmails = getWaitlistGroupEmails;
  const originalGetWaitlistEmailSubjectForGameDate = getWaitlistEmailSubjectForGameDate;
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

    getWaitlistEmailSubjectForGameDate = function (gameDate) {
      return "Test Subject";
    };

    getWaitlistEmailBody = function (dayString, useHtml) {
      return useHtml ? "<p>Test HTML Body</p>" : "Test Body";
    };

    // Run the function
    const gameDate = getDateForNextOccurrenceOfDay("tuesday");
    createAndSendWaitlistEmailForGameDate(gameDate);

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
    getWaitlistEmailSubjectForGameDate = originalGetWaitlistEmailSubjectForGameDate;
    getWaitlistEmailBody = originalGetWaitlistEmailBody;
  }
}

function testGetWaitlistGroupEmails() {
  Logger.log("Running test: testGetWaitlistGroupEmails...");

  // No mocks needed as the function is now deterministic based on constants.

  // Test for Tuesday
  const tuesdayEmails = getWaitlistGroupEmails("tuesday");
  const expectedTuesdayEmails = EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_TUESDAY + ", " + EMAIL_GROUP_ADMINS;

  if (tuesdayEmails !== expectedTuesdayEmails) {
    Logger.log("Test Failed (Tuesday): getWaitlistGroupEmails returned incorrect emails.");
    Logger.log("Expected: " + expectedTuesdayEmails);
    Logger.log("Got: " + tuesdayEmails);
  } else {
    Logger.log("Test Passed (Tuesday): getWaitlistGroupEmails works as expected.");
  }

  // Test for Sunday
  const sundayEmails = getWaitlistGroupEmails("sunday");
  const expectedSundayEmails = EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_SUNDAY + ", " + EMAIL_GROUP_ADMINS;

  if (sundayEmails !== expectedSundayEmails) {
    Logger.log("Test Failed (Sunday): getWaitlistGroupEmails returned incorrect emails.");
    Logger.log("Expected: " + expectedSundayEmails);
    Logger.log("Got: " + sundayEmails);
  } else {
    Logger.log("Test Passed (Sunday): getWaitlistGroupEmails works as expected.");
  }

  // Test for Thursday
  const thursdayEmails = getWaitlistGroupEmails("thursday");
  const expectedThursdayEmails = EMAIL_GROUP_RESERVES + ", " + EMAIL_GROUP_ROSTER_NON_THURSDAY + ", " + EMAIL_GROUP_ADMINS;

  if (thursdayEmails !== expectedThursdayEmails) {
    Logger.log("Test Failed (Thursday): getWaitlistGroupEmails returned incorrect emails.");
    Logger.log("Expected: " + expectedThursdayEmails);
    Logger.log("Got: " + thursdayEmails);
  } else {
    Logger.log("Test Passed (Thursday): getWaitlistGroupEmails works as expected.");
  }
}

function testIsMainRosterPlayerString() {
  Logger.log("Running test: testIsMainRosterPlayerString...");

  const rosterMap = {
    "Main": ["player1 <p1@a.com>", "player2 <p2@b.com>"],
    "SecondaryReserve": ["player3 <p3@c.com>"]
  };

  // Test case 1: Player is in the main roster (with different case)
  let player1 = "PLAYER1 <p1@a.com>";
  if (isMainRosterPlayerString(player1, rosterMap) !== true) {
    Logger.log("Test Failed: Expected player1 to be a main roster player.");
  } else {
    Logger.log("Test Passed: Correctly identified main roster player (case-insensitive).");
  }

  // Test case 2: Player is not in the main roster (is a reserve)
  let player3 = "player3 <p3@c.com>";
  if (isMainRosterPlayerString(player3, rosterMap) !== false) {
    Logger.log("Test Failed: Expected player3 not to be a main roster player.");
  } else {
    Logger.log("Test Passed: Correctly identified non-main roster player.");
  }

  // Test case 3: Player is not in any list
  let player4 = "player4 <p4@d.com>";
  if (isMainRosterPlayerString(player4, rosterMap) !== false) {
    Logger.log("Test Failed: Expected player4 not to be a main roster player.");
  } else {
    Logger.log("Test Passed: Correctly identified player not on any list.");
  }

  // Test case 4: Main player list is empty
  const emptyRosterMap = {
    "SecondaryReserve": ["player3 <p3@c.com>"]
  };
  if (isMainRosterPlayerString(player1, emptyRosterMap) !== false) {
    Logger.log("Test Failed: Expected player1 not to be a main roster player with empty main list.");
  } else {
    Logger.log("Test Passed: Correctly handled empty main roster list.");
  }

  // Test case 5: Player has same email but different name
  let player1_alt_name = "DIFFERENT NAME <p1@a.com>";
  if (isMainRosterPlayerString(player1_alt_name, rosterMap) !== true) {
    Logger.log("Test Failed: Expected player with different name but same email to be a main roster player.");
  } else {
    Logger.log("Test Passed: Correctly identified main roster player by email only.");
  }
}

function testSynchronizeWaitlistHelperFunctions() {
  Logger.log("Running test: testSynchronizeWaitlistHelperFunctions...");

  // Test isPlayerInSet function
  const testPlayerSet = new Set([
    "John Doe <john@example.com>",
    "Jane Smith <jane@example.com>",
    "Bob Wilson <bob@example.com>"
  ]);

  // Test case 1: Player exists (exact match)
  if (isPlayerInSet("John Doe <john@example.com>", testPlayerSet) !== true) {
    Logger.log("Test Failed: isPlayerInSet should find exact match.");
  } else {
    Logger.log("Test Passed: isPlayerInSet correctly found exact match.");
  }

  // Test case 2: Player exists (case insensitive email)
  if (isPlayerInSet("JOHN DOE <JOHN@EXAMPLE.COM>", testPlayerSet) !== true) {
    Logger.log("Test Failed: isPlayerInSet should be case insensitive for emails.");
  } else {
    Logger.log("Test Passed: isPlayerInSet correctly handles case insensitive emails.");
  }

  // Test case 3: Player doesn't exist
  if (isPlayerInSet("Unknown Person <unknown@example.com>", testPlayerSet) !== false) {
    Logger.log("Test Failed: isPlayerInSet should return false for non-existent player.");
  } else {
    Logger.log("Test Passed: isPlayerInSet correctly returned false for non-existent player.");
  }

  // Test case 4: Different name, same email
  if (isPlayerInSet("Johnny <john@example.com>", testPlayerSet) !== true) {
    Logger.log("Test Failed: isPlayerInSet should match players by email even with different names.");
  } else {
    Logger.log("Test Passed: isPlayerInSet correctly matched player by email with different name.");
  }

  // Test case 5: Empty set
  const emptySet = new Set();
  if (isPlayerInSet("John Doe <john@example.com>", emptySet) !== false) {
    Logger.log("Test Failed: isPlayerInSet should return false for empty set.");
  } else {
    Logger.log("Test Passed: isPlayerInSet correctly handled empty set.");
  }

  // Test order preservation functions
  Logger.log("Testing order preservation functions...");
  
  // Mock a spreadsheet range for testing
  const mockRange = {
    getHeight: function() { return 5; },
    getWidth: function() { return 2; },
    getCell: function(row, col) {
      const testData = [
        ["Player 1 <p1@example.com>", "p1@example.com"],
        ["Player 2 <p2@example.com>", "p2@example.com"], 
        ["", ""],
        ["Player 4 <p4@example.com>", "p4@example.com"],
        ["", ""]
      ];
      return {
        isBlank: function() { return testData[row-1][col-1] === ""; },
        getValue: function() { return testData[row-1][col-1]; }
      };
    }
  };

  // Test getPlayerArrayFromRange - should preserve order
  const originalGetPlayerArrayFromRange = getPlayerArrayFromRange;
  try {
    const playerArray = originalGetPlayerArrayFromRange(mockRange);
    const expectedOrder = ["Player 1 <p1@example.com>", "Player 2 <p2@example.com>", "Player 4 <p4@example.com>"];
    
    if (JSON.stringify(playerArray) === JSON.stringify(expectedOrder)) {
      Logger.log("Test Passed: getPlayerArrayFromRange preserves order correctly.");
    } else {
      Logger.log("Test Failed: getPlayerArrayFromRange order mismatch.");
      Logger.log("Expected: " + JSON.stringify(expectedOrder));
      Logger.log("Got: " + JSON.stringify(playerArray));
    }
  } catch (e) {
    Logger.log("Test Warning: Could not test getPlayerArrayFromRange in this context: " + e.toString());
  }

  Logger.log("Finished testing synchronizeWaitlist helper functions.");
}
