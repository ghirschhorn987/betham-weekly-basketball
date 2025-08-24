//========================================
// Player helper functions
// (player is a string in "name <email>" form)
//========================================
function normalizePlayer(player) {
  const name = getNameFromPlayer(player);
  const email = getEmailFromPlayer(player);
  if (name == "") {
    return email;
  } else {
    return name + " <" + email + ">";
  }
}

function playersAreEqual(player1, player2) {
  return getNameFromPlayer(player1) == getNameFromPlayer(player2)
    && getEmailFromPlayer(player1) == getEmailFromPlayer(player2);
}

function getNameFromPlayer(player) {
  var name;
  const indexOfLessThanSign = player.indexOf("<");
  if (indexOfLessThanSign == -1) {
    name = "";
  } else {
    name = player.substring(0, indexOfLessThanSign);
  }
  return name.trim();
}

function getEmailFromPlayer(player) {
  var email;
  const indexOfLessThanSign = player.indexOf("<");
  if (indexOfLessThanSign == -1) {
    email = player;
  } else {
    const indexOfGreaterThanSign = player.indexOf(">");
    email = player.substring(indexOfLessThanSign + 1, indexOfGreaterThanSign);
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

function removeDuplicatePlayersFromSet(playerSet) {
  const modifiedPlayerSet = new Set();
  const existingNames = new Set();
  const existingEmails = new Set();
  playerSet.forEach(function (player) {
    const name = getNameFromPlayer(player);
    const email = getEmailFromPlayer(player);
    if (existingNames.has(name) || existingEmails.has(email)) {
      Logger.log("Removing duplicate player from set: " + player);
    } else {
      existingNames.add(name);
      existingEmails.add(email);
      modifiedPlayerSet.add(player);
    }
  });
  return modifiedPlayerSet;
}

function removePlayersAlreadyInOtherSet(sourcePlayerSet, otherPlayerSet) {
  // Get unique sets of just names and just emails
  const otherSetNames = new Set();
  const otherSetEmails = new Set();
  otherPlayerSet.forEach(function (player) {
    const name = getNameFromPlayer(player);
    const email = getEmailFromPlayer(player);
    otherSetNames.add(name);
    otherSetEmails.add(email);
  });

  // Only keep source if neither name nor emamil already included.
  const modifiedSourcePlayerSet = new Set();
  sourcePlayerSet.forEach(function (player) {
    const name = getNameFromPlayer(player);
    const email = getEmailFromPlayer(player);
    if (otherSetNames.has(name) || otherSetEmails.has(email)) {
      // Logger.log("Removing player in other set from set: " + player);
    } else {
      modifiedSourcePlayerSet.add(player);
    }
  });

  return modifiedSourcePlayerSet;
}

function addPlayerToMap(map, player, latestReply) {
  for (const existingPlayer of map.keys()) {
    if (playersAreEqual(existingPlayer, player)) {
      map.set(existingPlayer, latestReply);
      return;
    }
  }
  map.set(player, latestReply);
}

function deletePlayerFromMap(map, player) {
  for (const existingPlayer of map.keys()) {
    if (playersAreEqual(existingPlayer, player)) {
      map.delete(existingPlayer);
      return;
    }
  }
  map.delete(player);
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

function logEmailAddressesAsCommaSeparatedListForTypeAndDay(listType, day) {
  Logger.log("listType=" + listType + ", day=" + day);

  const spreadsheet = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);

  var allPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(ALL_EMAIL_RANGE_NAME)));
  allPlayers = removeDuplicatePlayersFromSet(allPlayers);

  if (day != undefined) {
    var requestedDayPlayers = new Set(getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(getRosterEmailRangeName(day))));
  }
  var tuesdayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(getRosterEmailRangeName("tuesday"))));
  var thursdayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(getRosterEmailRangeName("thursday"))));
  var sundayPlayers = new Set(
    getSpreadsheetRangeValuesAsArray(spreadsheet.getRangeByName(getRosterEmailRangeName("sunday"))));
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
      Logger.log("requestedDay=" + day + ", requestedDayPlayers.size=" + requestedDayPlayers.size);
      break;
    case "rosterOtherThanDay":
      playerList = rosterPlayers;
      switch (day) {
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
      Logger.log("requestedDay=" + day + ", rosterOtherThanDay.size=" + playerList.size);
  }

  // Shouldn't be needed but can't hurt
  playerList = removeDuplicatePlayersFromSet(playerList);

  Logger.log("\n\n==========\n" + listType + " players, " + day + ", " + playerList.size + " players:\n=========\n" + Array.from(playerList).join(', ') + "\n==========");
}

