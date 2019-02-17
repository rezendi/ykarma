import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
      // Readme
      "Welcome to YKarma!": "Welcome to YKarma!",
      "YKarma is": "YKarma is an experimental project to model reputation as a spendable currency.",
      'The basic concept': 'The basic concept: every person in a community or organization is allotted 100 "karma coins" to distribute each week. These must be given away to other people before they can be used. The recipients can then spend these coins on various rewards (a day off, a conference ticket, a coffee with someone, etc.)',
      'For more info' : 'For more information, see <1>the project README</1> or email <3>info@ykarma.com</3>.',
      
      // Account
      "Profile" : "Profile",
      "Rewards" : "Rewards",
      'Has sold' : 'Has sold',
      "rewards for a total of" : "rewards for a total of",
      "karma." : "karma."
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