//========================================
// Email template helper functions
//========================================
function getRosterEmailSubject(dayString) {
  var subject;
  if (USE_OVERRIDE_VALUES) {
    subject = OVERRIDE_ROSTER_EMAIL_SUBJECT;
  } else {
    subject = "Beth Am <<DAY_UPPERCASE>> Basketball: Sign up for <<DAY_LOWERCASE>>, <<DATE>>, <<GAME_TIME>>";
    subject = subject.replace("<<DAY_UPPERCASE>>", dayString.toUpperCase());
    subject = subject.replace("<<DAY_LOWERCASE>>", capitalizeFirstLetter(dayString));
    subject = subject.replace("<<DATE>>", getDateAsString(getDateForNextOccurrenceOfDay(dayString)));
    subject = subject.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  }
  return subject;
}

function getWaitlistEmailSubjectForDay(dayString) {
  var subject;
  if (USE_OVERRIDE_VALUES) {
    subject = OVERRIDE_WAITLIST_EMAIL_SUBJECT;
  } else {
    subject = "Beth Am <<DAY_UPPERCASE>> Basketball: Possible open spots for tonight, <<DATE>>, <<GAME_TIME>>";
    subject = subject.replace("<<DAY_UPPERCASE>>", dayString.toUpperCase());
    subject = subject.replace("<<DATE>>", getDateAsString(getDateForNextOccurrenceOfDay(dayString)));
    subject = subject.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  }
  return subject;
}

function getWaitlistEmailSubjectForDate(date) {
  var subject;
  if (USE_OVERRIDE_VALUES) {
    subject = OVERRIDE_WAITLIST_EMAIL_SUBJECT;
  } else {
    subject = "Basketball: Possible open spots for tonight, <<DATE>>";
    subject = subject.replace("<<DATE>>", getDateAsString(date));
  }
  return subject;
}

function getInitialWaitlistReplyEmailSubjectForDay(dayString) {
  return getWaitlistEmailSubjectForDay(dayString);
}

function getFinalWaitlistReplyEmailSubjectForDay(dayString) {
  return getWaitlistEmailSubjectForDay(dayString);
}

function getRosterEmailBody(dayString, useHtml) {
  var body;
  if (useHtml) {
    body = `
Sign-up for the <<DAY_OF_WEEK>> night game this week (<<DATE>>, <<GAME_TIME>>) is open here: <<SIGNUP_URL>>. (If this link doesn't work for you on mobile, try this <a href='<<ALTERNATE_SIGNUP_URL>>'>alternate link</a>. And let me know if this other link worked or not).

<p> IMPORTANT: If after signing up you can't make it, simply remove yourself from the spreadsheet. No need to email if it is BEFORE 5pm on game day. AFTER 5pm, please both remove yourself AND email <<EMAIL_GROUP_ADMINS>>.

<p>Regards,
<br>Gary
`;
  } else {
    body = `
Sign-up for the <<DAY_OF_WEEK>> night game this week (<<DATE>>, <<GAME_TIME>>) is open here: <<SIGNUP_URL>>. (If this link doesn't work for you on mobile, try this alternate link: <<ALTERNATE_SIGNUP_URL>>. And let me know if this other link worked or not).

IMPORTANT: If after signing up you can't make it, simply remove yourself from the spreadsheet. No need to email if it is BEFORE 5pm on game day. AFTER 5pm, please both remove yourself AND email <<EMAIL_GROUP_ADMINS>>.

Regards,
Gary
`;
  }

  body = body.replace("<<DAY_OF_WEEK>>", dayString.toUpperCase());
  body = body.replace("<<DATE>>", getDateAsString(getDateForNextOccurrenceOfDay(dayString)));
  body = body.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  body = body.replace("<<SIGNUP_URL>>", getRsvpSignupUrl(dayString));
  body = body.replace("<<ALTERNATE_SIGNUP_URL>>", getRsvpSignupAlternateUrl(dayString));
  body = body.replace("<<EMAIL_GROUP_ADMINS>>", EMAIL_GROUP_ADMINS);

  return body;
}

function getWaitlistEmailBody(dayString, useHtml) {
  var body;

  if (useHtml) {
    body = `
We may have some open spots for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. If you want to play, please follow the instructions carefully. 

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
  <li>The sequence used for filling up spots is randomized order for all those who respond in the first hour. Subsequent responses are added in order received after that.
</ul>

<p>I will let you know by <<CONFIRMATION_TIME>> tonight if you are in or not.

<p>Regards,
<br>Gary
`;
  } else {
    body = `
We may have some open spots for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. If you want to play, please follow the instructions carefully. 

THIS IS AN AUTOMATED PROCESS. If you don't follow instructions, your reply will be ignored.

If you are interested in playing:
  - Please Reply All (not just Reply) to this email.
  - Only one person per reply - each person playing must reply from their own email.
  - The first word MUST be "In". (You can add additional text as well, but see other points below.)
  - If you realize you can't play after replying "In", please reply again with first word being "Out". (This frees up your spot for someone else, and again, you can add additional text.)

Some other points:
  - You can add additional messaging to me or others after the first word. I will try to read and respond but there are no guarantees!
  - The sequence used for filling up spots is randomized order for all those who respond in the first hour. Subsequent responses are added in order received after that.

I will let you know by <<CONFIRMATION_TIME>> tonight if you are in or not.

Regards,
Gary
`;
  }

  body = body.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  body = body.replace("<<CONFIRMATION_TIME>>", WAITLIST_CONFIRMATION_TIME_STRING);
  return body;
}

function getInitialWaitlistReplyEmailBody(dayString, openSpotCount, emails, useHtml) {
  var body;
  if (useHtml) {
    body = `
We currently have <<OPEN_SPOTS>> open spots for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. This number is tentative and may change -- final confirmation of who is in will be sent between <<CONFIRMATION_TIME_RANGE>>.

<p>Here is the current waitlist in order:
<<EMAILS_SEPARATED_BY_NEWLINES>>

<p>If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

<p>Regards,
<br>Gary
`;
  } else {
    body = `
We currently have <<OPEN_SPOTS>> open spots for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. This number is tentative and may change -- final confirmation of who is in will be sent between <<CONFIRMATION_TIME_RANGE>>.

Here is the current waitlist in order:
<<EMAILS_SEPARATED_BY_NEWLINES>>

If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

Regards,
Gary
`;
  }

  body = body.replace("<<OPEN_SPOTS>>", openSpotCount);
  body = body.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  body = body.replace("<<CONFIRMATION_TIME_RANGE>>", WAITLIST_CONFIRMATION_TIME_RANGE_STRING);
  if (useHtml) {
    body = body.replace("<<EMAILS_SEPARATED_BY_NEWLINES>>",
      arrayAsHtmlItemizedList(emails));
  } else {
    body = body.replace("<<EMAILS_SEPARATED_BY_NEWLINES>>",
      arrayAsNewLineSeparatedString(emails));
  }

  return body;
}

function getFinalWaitlistReplyEmailBody(dayString, openSpotCount, emailsInGame, emailsOnWaitlist, useHtml) {
  var body;
  if (useHtml) {
    body = `
This email is the final confirmation of which waitlist players are in for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. We have <<OPEN_SPOTS>> open spots.

<p>These players are in:
<<EMAILS_IN_GAME_SEPARATED_BY_NEWLINES>>

<p>These players are next up if someone drops out:
<<EMAILS_ON_WAITLIST_SEPARATED_BY_NEWLINES>>

<p>If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

<p>Regards,
<br>Gary
`;
  } else {
    body = `
This email is the final confirmation of which waitlist players are in for basketball tonight (<<GAME_TIME>>) at Temple Beth Am. We have <<OPEN_SPOTS>> open spots.

These players are in:
<<EMAILS_IN_GAME_SEPARATED_BY_NEWLINES>>

These players are next up if someone drops out:
<<EMAILS_ON_WAITLIST_SEPARATED_BY_NEWLINES>>

If you have replied "In" but later realize you can't play, please reply again with "Out". (Only the last response is counted.)

Regards,
Gary
`;
  }

  body = body.replace("<<OPEN_SPOTS>>", openSpotCount);
  body = body.replace("<<GAME_TIME>>", getGameTimeString(dayString));
  if (useHtml) {
    body = body.replace("<<EMAILS_IN_GAME_SEPARATED_BY_NEWLINES>>",
      arrayAsHtmlItemizedList(emailsInGame));
    body = body.replace("<<EMAILS_ON_WAITLIST_SEPARATED_BY_NEWLINES>>",
      arrayAsHtmlItemizedList(emailsOnWaitlist));
  } else {
    body = body.replace("<<EMAILS_IN_GAME_SEPARATED_BY_NEWLINES>>",
      arrayAsNewLineSeparatedString(emailsInGame));
    body = body.replace("<<EMAILS_ON_WAITLIST_SEPARATED_BY_NEWLINES>>",
      arrayAsNewLineSeparatedString(emailsOnWaitlist));
  }

  return body;
}