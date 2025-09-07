//========================================
// Player helper functions
// (player is a string in "name <email>" form)
//========================================
function normalizePlayerString(playerString) {
  const name = getNameFromPlayerString(playerString);
  const email = getEmailFromPlayerString(playerString);
  if (name == "") {
    return email;
  } else {
    return name + " <" + email + ">";
  }
}

function playerStringsAreEqual(playerString1, playerString2) {
  return getNameFromPlayerString(playerString1) == getNameFromPlayerString(playerString2)
    && getEmailFromPlayerString(playerString1) == getEmailFromPlayerString(playerString2);
}

function getNameFromPlayerString(playerString) {
  var name;
  const indexOfLessThanSign = playerString.indexOf("<");
  if (indexOfLessThanSign == -1) {
    name = "";
  } else {
    name = playerString.substring(0, indexOfLessThanSign);
  }
  return name.trim();
}

function getEmailFromPlayerString(playerString) {
  var email;
  const indexOfLessThanSign = playerString.indexOf("<");
  if (indexOfLessThanSign == -1) {
    email = playerString;
  } else {
    const indexOfGreaterThanSign = playerString.indexOf(">");
    email = playerString.substring(indexOfLessThanSign + 1, indexOfGreaterThanSign);
  }

  // Remove things after plus sign from emails like "+canned-response@gmail.com"
  const isGmail = email.endsWith("gmail.com");
  const indexOfPlus = email.indexOf("+");
  if (isGmail && indexOfPlus != -1) {
    const indexOfAt = email.indexOf("@");
    email = email.substring(0, indexOfPlus) + email.substring(indexOfAt);
  }
  return email.trim();
}

function removeDuplicatePlayersFromSet(playerStringSet) {
  const modifiedPlayerSet = new Set();
  const existingNames = new Set();
  const existingEmails = new Set();
  playerStringSet.forEach(function (playerString) {
    const name = getNameFromPlayerString(playerString);
    const email = getEmailFromPlayerString(playerString);
    if (existingNames.has(name) || existingEmails.has(email)) {
      Logger.log("Removing duplicate player from set: " + playerString);
    } else {
      existingNames.add(name);
      existingEmails.add(email);
      modifiedPlayerSet.add(playerString);
    }
  });
  return modifiedPlayerSet;
}

function removePlayersAlreadyInOtherSet(sourcePlayerSet, otherPlayerSet) {
  // Get unique sets of just names and just emails
  const otherSetNames = new Set();
  const otherSetEmails = new Set();
  otherPlayerSet.forEach(function (player) {
    const name = getNameFromPlayerString(player);
    const email = getEmailFromPlayerString(player);
    otherSetNames.add(name);
    otherSetEmails.add(email);
  });

  // Only keep source if neither name nor emamil already included.
  const modifiedSourcePlayerSet = new Set();
  sourcePlayerSet.forEach(function (player) {
    const name = getNameFromPlayerString(player);
    const email = getEmailFromPlayerString(player);
    if (otherSetNames.has(name) || otherSetEmails.has(email)) {
      // Logger.log("Removing player in other set from set: " + player);
    } else {
      modifiedSourcePlayerSet.add(player);
    }
  });

  return modifiedSourcePlayerSet;
}

function addPlayerStringToMap(map, playerString, latestReply) {
  for (const existingPlayer of map.keys()) {
    if (playerStringsAreEqual(existingPlayer, playerString)) {
      map.set(existingPlayer, latestReply);
      return;
    }
  }
  map.set(playerString, latestReply);
}

function deletePlayerStringFromMap(map, playerString) {
  for (const existingPlayerString of map.keys()) {
    if (playerStringsAreEqual(existingPlayerString, playerString)) {
      map.delete(existingPlayerString);
      return;
    }
  }
  map.delete(playerString);
}

function logEmailAddressesAsCommaSeparatedList() {
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("reserves");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterForDay", "tuesday");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterForDay", "thursday");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterForDay", "sunday");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterOtherThanDay", "tuesday");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterOtherThanDay", "thursday");
  logEmailAddressesAsCommaSeparatedListForTypeAndDay("rosterOtherThanDay", "sunday");
}

function logEmailAddressesAsCommaSeparatedListForTypeAndDay(listType, dayString) {
  Logger.log("listType=" + listType + ", day=" + dayString);

  const rosterSpreadsheet = getRosterSpreadsheet();
  
  var allPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(rosterSpreadsheet.getRangeByName(ALL_EMAIL_RANGE_NAME)));
  allPlayers = removeDuplicatePlayersFromSet(allPlayers);

  if (dayString != undefined) {
    var requestedDayPlayers = new Set(getSpreadsheetRangeValuesAsArray(rosterSpreadsheet.getRangeByName(getRosterEmailRangeName(dayString))));
  }
  var tuesdayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(rosterSpreadsheet.getRangeByName(getRosterEmailRangeName("tuesday"))));
  var thursdayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(rosterSpreadsheet.getRangeByName(getRosterEmailRangeName("thursday"))));
  var sundayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(rosterSpreadsheet.getRangeByName(getRosterEmailRangeName("sunday"))));
  var rosterPlayers = new Set([...tuesdayPlayers, ...thursdayPlayers, ...sundayPlayers]);

  Logger.log("allPlayers.size=" + allPlayers.size);
  Logger.log("rosterPlayers.size=" + rosterPlayers.size);
  Logger.log("tuesdayPlayers.size=" + tuesdayPlayers.size);
  Logger.log("thursdayPlayers.size=" + thursdayPlayers.size);
  Logger.log("sundayPlayers.size=" + sundayPlayers.size);

  var playerList;
  switch (listType) {
    case "reserves":
      playerList = allPlayers;
      playerList = removePlayersAlreadyInOtherSet(playerList, tuesdayPlayers);
      playerList = removePlayersAlreadyInOtherSet(playerList, thursdayPlayers);
      playerList = removePlayersAlreadyInOtherSet(playerList, sundayPlayers);
      Logger.log("reserves.size=" + playerList.size);
      break;
    case "rosterForDay":
      playerList = requestedDayPlayers;
      Logger.log("requestedDay=" + dayString + ", requestedDayPlayers.size=" + requestedDayPlayers.size);
      break;
    case "rosterOtherThanDay":
      playerList = rosterPlayers;
      switch (dayString) {
        case "sunday":
          playerList = removePlayersAlreadyInOtherSet(playerList, sundayPlayers);
          break;
        case "tuesday":
          playerList = removePlayersAlreadyInOtherSet(playerList, tuesdayPlayers);
          break;
        case "thursday":
          playerList = removePlayersAlreadyInOtherSet(playerList, thursdayPlayers);
          break;
      }
      Logger.log("requestedDay=" + dayString + ", rosterOtherThanDay.size=" + playerList.size);
  }

  // Shouldn't be needed but can't hurt
  playerList = removeDuplicatePlayersFromSet(playerList);

  Logger.log("\n\n==========\n" + listType + " players, " + dayString + ", " + playerList.size + " players:\n=========\n" + Array.from(playerList).join(', ') + "\n==========");
}

function getRosterTypeToPlayerStrings() {
  const rosterSheet = getRosterSpreadsheet();
  const range = rosterSheet.getRangeByName(ALL_EMAIL_AND_ROSTER_TYPES_RANGE_NAME);
  const values = range.getValues();

  const rosterTypeToPlayerStrings = {};

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const playerString = normalizePlayerString(row[0]);
    const rosterType = row[1];

    if (playerString && rosterType && rosterType.trim() !== "") {
      if (!rosterTypeToPlayerStrings[rosterType]) {
        rosterTypeToPlayerStrings[rosterType] = [];
      }
      rosterTypeToPlayerStrings[rosterType].push(playerString);
    }
  }

  return rosterTypeToPlayerStrings;
}

function getMainRosterPlayerStrings(rosterMap) {
  return rosterMap[PLAYER_TYPE_MAIN] || [];
}

function getSecondaryReserveRosterPlayerStrings(rosterMap) {
  return rosterMap[PLAYER_TYPE_SECONDARY_RESERVE] || [];
}

function isMainRosterPlayerString(playerString, rosterTypeToPlayerStrings) {
  const mainPlayers = rosterTypeToPlayerStrings[PLAYER_TYPE_MAIN] || [];
  const inputEmail = getEmailFromPlayerString(playerString).toLowerCase();
  return mainPlayers.some(mainPlayer => getEmailFromPlayerString(mainPlayer).toLowerCase() === inputEmail);
}
