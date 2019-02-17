import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {

      // Header
      "Sign Out" : "Sign Out",
      "Log In" : "Log In",
      "Profile" : "Profile",
      "Rewards" : "Rewards",
      "Community" : "Community",
      "About" : "About",
      "Admin" : "Admin",
      
      // Readme
      "Welcome to YKarma!": "Welcome to YKarma!",
      "YKarma is": "YKarma is an experimental project to model reputation as a spendable currency.",
      'The basic concept': 'The basic concept: every person in a community or organization is allotted 100 "karma coins" to distribute each week. These must be given away to other people before they can be used. The recipients can then spend these coins on various rewards (a day off, a conference ticket, a coffee with someone, etc.)',
      "For more info" : "For more information, see <1>the project README</1> or email <3>info@ykarma.com</3>.",
      
      // Account
      'Has sold' : 'Has sold',
      "rewards for a total of" : "rewards for a total of",
      "karma." : "karma.",
      
      // Community
      "Loading..." : "Loading",
      "Server error..." : "Server error",
      "members" : "members",
      "You have" : "You have",
      "karma available to give." : "karma available to give.",

      // FinishSignIn
      "Logging you in..." : "Logging you in...",

      // Home
      "You are not (yet) a member of any YKarma community." : "You are not (yet) a member of any YKarma community.",
      "First login detected, populating your account..." : "First login detected, populating your account...",
      "Please wait while we pile another block or two on the blockchain..." : "Please wait while we pile another block or two on the blockchain...",
      "Howdy," : "Howdy,",
      "You are a member of" : "You are a member of",
      "which has" : "which has",
      "members / invitees." : "members / invitees.",
      "For every 100 you give, you get 10 to spend." : "For every 100 you give, you get 10 to spend.",
      "karma" : "karma",
      "to" : "to",
      "because" : "because",
      "Give" : "Give",
      "Spend" : "Spend",
      "total karma available to spend." : "total karma available to spend.",
      "Top reward:" : "Top reward:",
      "View All Available Rewards" : "View All Available Rewards",
      "Given" : "Given",
      "Received" : "Received",

      "" : "",
    }
  }
};

i18n
.use(initReactI18next) // passes i18n down to react-i18next
.init({
  resources,
  lng: "en",

  keySeparator: false, // we do not use keys in form messages.welcome

  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;