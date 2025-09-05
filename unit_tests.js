// This file will hold unit tests.

function runAllTests() {
  Logger.log("Starting test suite...");
  
  testGetRosterMap();
  testGetMainRosterPlayers();

  Logger.log("Test suite finished.");
}

function testGetRosterMap() {
  // Mock SpreadsheetApp
  const originalSpreadsheetApp = SpreadsheetApp;
  SpreadsheetApp = {
    openById: function(id) {
      return {
        getRangeByName: function(name) {
          return {
            getValues: function() {
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

  // Restore original SpreadsheetApp
  SpreadsheetApp = originalSpreadsheetApp;
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
