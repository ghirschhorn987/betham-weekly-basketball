//========================================
// Override certain constants for testing purposes. 
// WARNING!!! Must set back to null when done for scripts to act correcdly
//========================================
var USE_OVERRIDE_VALUES = true;

const OVERRIDE_EMAIL_RECIPIENT_LIST = "ghirschhorn987@gmail.com";
const OVERRIDE_RSVP_SPREADSHEET_ID = "1tTdOgJaba8QwJBtt2iiXJGbdXE91jSw2Ps6ZP2F2HX8"; // "SCRATCH COPY:  Beth Am THURSDAY Basketball - RSVP"
const OVERRIDE_ROSTER_EMAIL_SUBJECT = "TESTING - IGNORE THIS. Beth Am Basketball: Sign up for Thursday, Aug 28, 8-10pm";
const OVERRIDE_WAITLIST_EMAIL_SUBJECT = "TESTING - IGNORE THIS. Beth Am THURSDAY Basketball: Possible open spots for tonight, Aug 28, 8-10pm";
const OVERRIDE_LOG_EMAIL_INSTEAD_OF_SENDING = true; // if USE_OVERRIDE_VALUES is true, AND this is true, will log email instead of sending it

//========================================
// Production constants
//========================================
const ROSTER_SPREADSHEET_ID = "1Sue6ZR98PVYiz6MsotLygN43yKMbrHWuZROK9decd2s"; // "Beth Am Basketball Rosters";
const SIGNUP_SHEET_TEMPLATE_SPREADSHEET_ID  = "17yqm2p3UyC-aRbuCfdBqPsJ-OXwLqr_32BPN4XIdbY8" // "Beth Am Basetball - Signup Sheet Templates"
const SIGNUP_SHEET_TEMPLATE_GAME_RSVPS_TAB_NAME = "Game RSVPs";
const SIGNUP_SHEET_TEMPLATE_NO_GAME_TAB_NAME = "No Game";

const RSVP_SUNDAY_SPREADSHEET_ID = "1xzayTGekCry4jMy9iSbSiseyGuq4SWxAOh_fOCFQohw" // "Beth Am SUNDAY Basketball - RSVP"
const RSVP_TUESDAY_SPREADSHEET_ID = "1lzBKLk0sBvaYvn7omtz159B5jcsCJ2wP0JQ-TXvjZyA" // "Beth Am TUESDAY Basketball - RSVP"
const RSVP_THURSDAY_SPREADSHEET_ID = "1k0r1cDheY_acA3Kbx39uzRHjDlfZ4VeSCzPRbYweHaM" // "Beth Am THURSDAY Basketball - RSVP"
const RSVP_URL_SUNDAY = "https://docs.google.com/spreadsheets/d/" + RSVP_SUNDAY_SPREADSHEET_ID;
const RSVP_URL_TUESDAY = "https://docs.google.com/spreadsheets/d/" + RSVP_TUESDAY_SPREADSHEET_ID;
const RSVP_URL_THURSDAY = "https://docs.google.com/spreadsheets/d/" + RSVP_THURSDAY_SPREADSHEET_ID;
const RSVP_SHORT_URL_SUNDAY = "https://bethambasketball.short.gy/sunday-signup";
const RSVP_SHORT_URL_TUESDAY = "https://bethambasketball.short.gy/tuesday-signup";
const RSVP_SHORT_URL_THURSDAY = "https://bethambasketball.short.gy/thursday-signup";

const ALL_EMAIL_RANGE_NAME = "AllEmails";
const ALL_EMAIL_AND_ROSTER_TYPES_RANGE_NAME = "AllEmailsAndRosterTypes";
const ROSTER_EMAIL_RANGE_NAME_TUESDAY = "RosterEmailsTuesday";
const ROSTER_EMAIL_RANGE_NAME_THURSDAY = "RosterEmailsThursday";
const ROSTER_EMAIL_RANGE_NAME_SUNDAY = "RosterEmailsSunday";
const LAST_RUN_DAY_OF_WEEK_RANGE = "LastRunDayOfWeek";
const LAST_STEP_THAT_WAS_RUN_RANGE = "LastStepThatWasRun";

// Player types
const PLAYER_TYPE_MAIN = "Main";
const PLAYER_TYPE_SECONDARY_RESERVE = "SecondaryReserve";

const RSVP_CELLS_RANGE = "C8:G37";
const RSVP_CELLS_IN_GAME_RANGE = "C8:G22";
const RSVP_CELLS_WAITLIST_RANGE = "C23:G47";

const GAME_TIME_STRING_SUNDAY = "7-9pm";
const GAME_TIME_STRING_TUESDAY = "8-10pm";
const GAME_TIME_STRING_THURSDAY = "8-10pm";
const WAITLIST_CONFIRMATION_TIME_STRING = "6pm";
const WAITLIST_CONFIRMATION_TIME_RANGE_STRING = "between 5pm and 6pm"
const WAITLIST_IN_GAME_REPLY_LOWERCASE = "in";
const WAITLIST_OUT_OF_GAME_REPLY_LOWERCASE = "out";
const GHIRSCHHORN_NAME = "Gary Hirschhorn";
const GHIRSCHHORN_EMAIL = "ghirschhorn987@gmail.com";
const AUTOMATICALLY_RSVP_FOR_GHIRSCHHORN = true;
const NO_GAME_STRING = "NO GAME";

const EMAIL_GROUP_ADMINS = "beth-am-basketball-admins@googlegroups.com";
const EMAIL_GROUP_SUNDAY = "beth-am-basketball-sunday@googlegroups.com";
const EMAIL_GROUP_TUESDAY = "beth-am-basketball-tuesday@googlegroups.com";
const EMAIL_GROUP_THURSDAY = "beth-am-basketball-thursday@googlegroups.com";
const EMAIL_GROUP_RESERVES = "beth-am-basketball-reserves@googlegroups.com";
const EMAIL_GROUP_ROSTER_NON_SUNDAY = "beth-am-basketball-roster-non-sunday@googlegroups.com";
const EMAIL_GROUP_ROSTER_NON_TUESDAY = "beth-am-basketball-roster-non-tuesday@googlegroups.com";
const EMAIL_GROUP_ROSTER_NON_THURSDAY = "beth-am-basketball-roster-non-thursday@googlegroups.com";

// Optional: If you keep your primary and secondary waitlist email lists in
// dedicated Google Sheets, set their spreadsheet IDs here. If left blank,
// the code will fall back to reading the "Players" tab in the RSVP spreadsheet
// for the given day and using the "Group" column values (existing behavior).
const PRIMARY_WAITLIST_SPREADSHEET_ID = ""; // e.g. "1AbC..."
const SECONDARY_WAITLIST_SPREADSHEET_ID = ""; // e.g. "1XyZ..."

// Scheduled says when there is no game (due to gym not available or other reasons).
// Important, we need to time and time zone so that date is interpreted as Los Angeles
// date and not UTC. Time doesn't matter that much but use 5:00 so that if we accidentally
// use PDT instead (which is 1 hour later), we are still on same date.
// (PDT is 2nd Sunday in March to 1st Sunday in November, PST is other times)
const NO_GAME_DATES = new Set();
// NO GAMES 2025 SPRING
// Sun:  Feb 09, Mar 23, Apr 13, Apr 20, Jun 01, Jun 08
// Tue:  Feb 04, Apr 15, June 03, June 10
// Thur: Feb 06, Feb 13, Mar 13, Mar 27, Apr 17, May 15, May 29, Jun 05
NO_GAME_DATES.add((getDateAsString(new Date("2025-02-04 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-02-06 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-02-09 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-02-13 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-03-13 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-03-23 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-03-27 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-04-13 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-04-15 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-04-17 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-04-20 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-05-15 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-05-29 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-06-01 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-06-03 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-06-05 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-06-08 05:00 PDT"))));
NO_GAME_DATES.add((getDateAsString(new Date("2025-06-10 05:00 PDT"))));

