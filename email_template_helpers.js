//========================================
// Email template helper functions
//========================================
function getRosterEmailSubject(dayString) {
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_ROSTER_EMAIL_SUBJECT;
  } else {
    const dayUppercase = dayString.toUpperCase();
    const dayLowercase = capitalizeFirstLetter(dayString);
    const date = getDateAsString(getDateForNextOccurrenceOfDay(dayString));
    const gameTime = getGameTimeString(dayString);
    
    return `Beth Am ${dayUppercase} Basketball: Sign up for ${dayLowercase}, ${date}, ${gameTime}`;
  }
}

function getWaitlistEmailSubjectForGameDate(gameDate) {
  const gameDayString = getDateAsDayString(gameDate);
  
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_WAITLIST_EMAIL_SUBJECT;
  } else {
    const dayUppercase = gameDayString.toUpperCase();
    const date = getDateAsString(gameDate);
    const gameTime = getGameTimeString(gameDayString);
    
    return `Beth Am ${dayUppercase} Basketball: Possible open spots for tonight, ${date}, ${gameTime}`;
  }
}

function getInitialWaitlistReplyEmailSubjectForGameDate(gameDate) {
  return getWaitlistEmailSubjectForGameDate(gameDate);
}

function getFinalWaitlistReplyEmailSubjectForGameDate(gameDate) {
  return getWaitlistEmailSubjectForGameDate(gameDate);
}

function getRosterEmailBody(dayString, useHtml) {
  if (USE_OVERRIDE_VALUES) {
    return OVERRIDE_ROSTER_EMAIL_BODY;
  }

  const dayOfWeek = dayString.toUpperCase();
  const date = getDateAsString(getDateForNextOccurrenceOfDay(dayString));
  const gameTime = getGameTimeString(dayString);
  const signupUrl = getRsvpSignupUrl(dayString);
  const alternateSignupUrl = getRsvpSignupAlternateUrl(dayString);
  
  if (useHtml) {
    return `
Sign-up for the ${dayOfWeek} night game this week (${date}, ${gameTime}) is open here: ${signupUrl}. (If this link doesn't work for you on mobile, try this <a href='${alternateSignupUrl}'>alternate link</a>. And let me know if this other link worked or not).

<p> IMPORTANT: If after signing up you can't make it, simply remove yourself from the spreadsheet. No need to email if it is BEFORE 5pm on game day. AFTER 5pm, please both remove yourself AND email ${EMAIL_GROUP_ADMINS}.

<p>Regards,
<br>Gary
`;
  } else {
    return `
Sign-up for the ${dayOfWeek} night game this week (${date}, ${gameTime}) is open here: ${signupUrl}. (If this link doesn't work for you on mobile, try this alternate link: ${alternateSignupUrl}. And let me know if this other link worked or not).

IMPORTANT: If after signing up you can't make it, simply remove yourself from the spreadsheet. No need to email if it is BEFORE 5pm on game day. AFTER 5pm, please both remove yourself AND email ${EMAIL_GROUP_ADMINS}.

Regards,
Gary
`;
  }
}

function getWaitlistEmailBody(dayString, useHtml) {
  const gameTime = getGameTimeString(dayString);
  const confirmationTime = WAITLIST_CONFIRMATION_TIME_STRING;

  if (useHtml) {
    return `
We may have some open spots for basketball tonight (${gameTime}) at Temple Beth Am. If you want to play, please follow the instructions carefully. 

<p><b>THIS IS AN AUTOMATED PROCESS. If you don't follow instructions, your reply will be ignored.</b>

<p>If you are interested in playing:
<ol>
  <li>Please <b>Reply All</b> (not just Reply) to this email.
  <li><b>Only one person per reply</b> - each person playing must reply from their own email.
  <li><b>The first word MUST be "In".</b> (You can add additional text as well, but see other points below.)
  <li>If you realize you can't play after replying "In", please reply again with first word being "Out". (This frees up your spot for someone else, and again, you can add additional text.)
</ol>

<p>Some other points:
<ul>
  <li>You can add additional messaging to me or others after the first word. <b>I will try to read and respond but there are no guarantees!</b>
  <li>The sequence used for filling up open spots is a randomized ordering of those who respond in the first hour, with <b>first priority given to those on the Primary Reserve List</b>. That is, first the Primary Reserve List respondees are randomly sorted and added to the open spots. Then, the Secondary Reserve List respondees are randomly sorted and added to any remaining open spots. Responses after the first hour -- regardless of which Reserve List -- are added after that in the order received.
</ul>

<p>I will let you know by ${confirmationTime} tonight if you are in or not.

<p>Regards,
<br>Gary
`;
  } else {
    return `
We may have some open spots for basketball tonight (${gameTime}) at Temple Beth Am. If you want to play, please follow the instructions carefully. 

THIS IS AN AUTOMATED PROCESS. If you don't follow instructions, your reply will be ignored.

If you are interested in playing:
  - Please Reply All (not just Reply) to this email.
  - Only one person per reply - each person playing must reply from their own email.
  - The first word MUST be "In". (You can add additional text as well, but see other points below.)
  - If you realize you can't play after replying "In", please reply again with first word being "Out". (This frees up your spot for someone else, and again, you can add additional text.)

Some other points:
  - You can add additional messaging to me or others after the first word. I will try to read and respond but there are no guarantees!
  - The sequence used for filling up open spots is a randomized ordering of those who respond in the first hour, with first priority given to those on the Primary Reserve List. That is, first the Primary Reserve List respondees are randomly sorted and added to the open spots. Then, the Secondary Reserve List respondees are randomly sorted and added to any remaining open spots. Responses after the first hour -- regardless of which Reserve List -- are added after that in the order received.

I will let you know by ${confirmationTime} tonight if you are in or not.

Regards,
Gary
`;
  }
}

function getInitialWaitlistReplyEmailBody(dayString, openSpotCount, emails, useHtml) {
  const gameTime = getGameTimeString(dayString);
  const confirmationTimeRange = WAITLIST_CONFIRMATION_TIME_RANGE_STRING;
  const emailsList = useHtml ? 
    arrayAsHtmlItemizedList(emails) : 
    arrayAsNewLineSeparatedString(emails);

  if (useHtml) {
    return `
We currently have ${openSpotCount} open spots for basketball tonight (${gameTime}) at Temple Beth Am. This number is tentative and may change -- final confirmation of who is in will be sent between ${confirmationTimeRange}.

<p>Here is the current waitlist in order:
${emailsList}

<p>If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

<p>Regards,
<br>Gary
`;
  } else {
    return `
We currently have ${openSpotCount} open spots for basketball tonight (${gameTime}) at Temple Beth Am. This number is tentative and may change -- final confirmation of who is in will be sent between ${confirmationTimeRange}.

Here is the current waitlist in order:
${emailsList}

If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

Regards,
Gary
`;
  }
}

function getFinalWaitlistReplyEmailBody(dayString, openSpotCount, emailsInGame, emailsOnWaitlist, useHtml) {
  const gameTime = getGameTimeString(dayString);
  const emailsInGameList = useHtml ? 
    arrayAsHtmlItemizedList(emailsInGame) : 
    arrayAsNewLineSeparatedString(emailsInGame);
  const emailsOnWaitlistList = useHtml ? 
    arrayAsHtmlItemizedList(emailsOnWaitlist) : 
    arrayAsNewLineSeparatedString(emailsOnWaitlist);

  if (useHtml) {
    return `
This email is the final confirmation of which waitlist players are in for basketball tonight (${gameTime}) at Temple Beth Am. We have ${openSpotCount} open spots.

<p>These players are in:
${emailsInGameList}

<p>These players are next up if someone drops out:
${emailsOnWaitlistList}

<p>If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

<p>Regards,
<br>Gary
`;
  } else {
    return `
This email is the final confirmation of which waitlist players are in for basketball tonight (${gameTime}) at Temple Beth Am. We have ${openSpotCount} open spots.

These players are in:
${emailsInGameList}

These players are next up if someone drops out:
${emailsOnWaitlistList}

If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

Regards,
Gary
`;
  }
}

function getSynchronizedWaitlistUpdateEmailBody(dayString, playersAddedToGame, playersAddedToWaitlist, playersDroppedFromGame, playersDroppedFromWaitlist, currentWaitlistOrder, useHtml) {
  const gameTime = getGameTimeString(dayString);
  
  let playersAddedToGameList, playersAddedToWaitlistList, playersDroppedFromGameList, 
      playersDroppedFromWaitlistList, currentWaitlistOrderList;
      
  if (useHtml) {
    playersAddedToGameList = playersAddedToGame.length > 0 ? 
      arrayAsHtmlItemizedList(playersAddedToGame) : "<i>None</i>";
    playersAddedToWaitlistList = playersAddedToWaitlist.length > 0 ? 
      arrayAsHtmlItemizedList(playersAddedToWaitlist) : "<i>None</i>";
    playersDroppedFromGameList = playersDroppedFromGame.length > 0 ? 
      arrayAsHtmlItemizedList(playersDroppedFromGame) : "<i>None</i>";
    playersDroppedFromWaitlistList = playersDroppedFromWaitlist.length > 0 ? 
      arrayAsHtmlItemizedList(playersDroppedFromWaitlist) : "<i>None</i>";
    currentWaitlistOrderList = currentWaitlistOrder.length > 0 ? 
      arrayAsHtmlItemizedList(currentWaitlistOrder) : "<i>Empty</i>";
      
    return `
This email is an update regarding waitlist changes for basketball tonight (${gameTime}) at Temple Beth Am.

<p><b>Players added to the game:</b>
${playersAddedToGameList}

<p><b>Players added to the waitlist:</b>
${playersAddedToWaitlistList}

<p><b>Players who dropped out of the game:</b>
${playersDroppedFromGameList}

<p><b>Players who dropped off the waitlist:</b>
${playersDroppedFromWaitlistList}

<p><b>Current waitlist order:</b>
${currentWaitlistOrderList}

<p>If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

<p>Regards,
<br>Gary
`;
  } else {
    playersAddedToGameList = playersAddedToGame.length > 0 ? 
      arrayAsNewLineSeparatedString(playersAddedToGame) : "None";
    playersAddedToWaitlistList = playersAddedToWaitlist.length > 0 ? 
      arrayAsNewLineSeparatedString(playersAddedToWaitlist) : "None";
    playersDroppedFromGameList = playersDroppedFromGame.length > 0 ? 
      arrayAsNewLineSeparatedString(playersDroppedFromGame) : "None";
    playersDroppedFromWaitlistList = playersDroppedFromWaitlist.length > 0 ? 
      arrayAsNewLineSeparatedString(playersDroppedFromWaitlist) : "None";
    currentWaitlistOrderList = currentWaitlistOrder.length > 0 ? 
      arrayAsNewLineSeparatedString(currentWaitlistOrder) : "Empty";
      
    return `
This email is an update regarding waitlist changes for basketball tonight (${gameTime}) at Temple Beth Am.

Players added to the game:
${playersAddedToGameList}

Players added to the waitlist:
${playersAddedToWaitlistList}

Players who dropped out of the game:
${playersDroppedFromGameList}

Players who dropped off the waitlist:
${playersDroppedFromWaitlistList}

Current waitlist order:
${currentWaitlistOrderList}

If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

Regards,
Gary
`;
  }
}
