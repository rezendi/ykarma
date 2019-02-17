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
      
      // AccountForm
      
      // Community
      "Loading..." : "Loading",
      "Server error..." : "Server error",
      "members" : "members",
      "You have" : "You have",
      "karma available to give." : "karma available to give.",

      // CommunityForm
      
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
      "Top reward" : "Top reward",
      "View All Available Rewards" : "View All Available Rewards",
      "Given" : "Given",
      "Received" : "Received",

      // LinkEmail
      "Linking your email..." : "Linking your email...",

      // Login
      "Email sent!" : "Email sent!",
      "Email failed!" : "Email failed!",
      "Log In with Email" : "Log In with Email",
      "Email" : "Email",
      "Log In with Twitter" : "Log In with Twitter",
      "Log In with Slack" : "Log In with Slack",

      // Main
      "Stacking another block on the chain..." : "Stacking another block on the chain...",
      
      // Profile
      "Error" : "Error",
      "Nameless One" : "Nameless One",
      "Home" : "Home",
      "karma to spend." : "karma to spend.",
      "Add Twitter" : "Add Twitter",
      "Remove Twitter" : "Remove Twitter",
      "Add Email" : "Add Email",
      "Remove Email" : "Remove Email",
      "Edit Profile" : "Edit Profile",
      "Email Preferences" : "Email Preferences",
      "Whenever you receive karma" : "Whenever you receive karma",
      "Weekly updates, when your karma is replenished" : "Weekly updates, when your karma is replenished",
      "Edit" : "Edit",
      "Offered Rewards" : "Offered Rewards",
      "You have sold" : "You have sold",
      "Owned Rewards" : "Owned Rewards",
      "My Given Karma": "My Given Karma",
      "My Received Karma": "My Received Karma",
      
      // Reward
      "Cost" : "Cost",
      "Available" : "Available",
      "Description" : "Description",
      "Purchase" : "Purchase",

      // RewardForm
      "Invalid name" : "Invalid name",
      "Invalid cost" : "Invalid cost",
      "Invalid quantity" : "Invalid quantity",
      "Reward creation failed" : "Reward creation failed",
      "Server error!" : "Server error!",
      "Server failure!" : "Server failure!",
      "New Reward" : "New Reward",
      "Name" : "Name",
      "Qty" : "Qty",
      "Karma Flavor" : "Karma Flavor",
      "Offer This Reward" : "Offer This Reward",
      
      // RewardRow
      "cost" : "cost",
      "available" : "available",
      
      // Rewards
      "Available Rewards" : "Available Rewards",
      "My Rewards" : "My Rewards",
      "Rewards you have offered" : "Rewards you have offered",
      
      // Sign Out
      "Logging you out..." : "Logging you out...",
      
      // Tranche
      "unknown" : "unknown",
      "you" : "you",
      "sent" : "sent",
      "karma to" : "karma to",
      "at block" : "at block",
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