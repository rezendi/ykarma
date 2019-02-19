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
  },
  kr: {
    translation: {

      // Header
      "Sign Out" : "로그아웃",
      "Log In" : "로그인",
      "Profile" : "프로필",
      "Rewards" : "리워드",
      "Community" : "커뮤니티",
      "About" : "소개글",
      "Admin" : "관리",
      
      // Readme
      "Welcome to YKarma!": "환영합니다. YKarma입니다.",
      "YKarma is": "YKarma는 평판을 사용가능한 통화(spendable currency)로 모델을 하는 실험적인 프로젝트입니다.",
      "The basic concept": "커뮤니티 또는 조직의 모든 사람에게 매주 배포 할 100 개의 "카르마 코인"이 할당됩니다. 이 코인이 이용되기 위해서 다른 사람에게 코인을 주어야합니다. 코인을 받은 사람은 다양한 형태로  코인을 사용할 수 있습니다. (예, 하루 휴가, 컨퍼런스 티켓, 누군가와의 커피 한 잔 등.)",
      "For more info" : "더 자세한 정보를 원하신다면  <1>the project README</1> 확인히시거나 이메일을 보내주세요. email <3>info@ykarma.com</3>.",
      
      // Account
      'Has sold' : "팔았습니다.",
      "rewards for a total of" : "보상 총액",
      "karma." : "카르마.",
      
      // AccountForm
      
      // Community
      "Loading..." : "로딩",
      "Server error..." : "서버 오류",
      "members" : "사용자",
      "You have" : "보유",
      "karma available to give." : "줄 수 있는 카르마.",

      // CommunityForm
      
      // FinishSignIn
      "Logging you in..." : "로그인 중입니다.",

      // Home
      "You are not (yet) a member of any YKarma community." : "Y카르마 커뮤니티의 회원이 아닙니다.",
      "First login detected, populating your account..." : "첫 로그인을 확인하고 계정을 생성중입니다. ",
      "Please wait while we pile another block or two on the blockchain..." : "블록을 생성하는 동안 잠시만 기다려주세요.",
      "Howdy," : "안녕하세요,",
      "You are a member of" : "활동중인 커뮤니티",
      "which has" : "가지고 있는",
      "members / invitees." : "멤버 / 초대.",
      "For every 100 you give, you get 10 to spend." : "100을 줄 때 마다 10을 사용할 수 있습니다.",
      "karma" : "카르마",
      "to" : "to",
      "because" : "이유",
      "Give" : "보내기",
      "Spend" : "사용하기",
      "total karma available to spend." : "사용할 수 있는 전체 카르마",
      "Top reward" : "최고 리워드",
      "View All Available Rewards" : "모든 리워드 확인하기",
      "Given" : "주어진",
      "Received" : "받은 ",

      // LinkEmail
      "Linking your email..." : "이메일을 연결중입니다.",

      // Login
      "Email sent!" : "이메일을 보냈습니다.",
      "Email failed!" : "이메일 보내기 오류",
      "Log In with Email" : "이메일로 로그인하기",
      "Email" : "이메일",
      "Log In with Twitter" : "트위터로 로그인 하기",
      "Log In with Slack" : "슬랙으로 로그인 하기 ",

      // Main
      "Stacking another block on the chain..." : "체인에 다른 블록을 연결하고 있습니다.",
      
      // Profile
      "Error" : "에러",
      "Nameless One" : "무명인",
      "Home" : "홈",
      "karma to spend." : "카르마를 사용할 수 있음.",
      "Add Twitter" : "트위터 추가",
      "Remove Twitter" : "트위터 제거",
      "Add Email" : "이메일 추가",
      "Remove Email" : "이메일 제거",
      "Edit Profile" : "프로필 수정",
      "Email Preferences" : "이메일 환경설정",
      "Whenever you receive karma" : "카르마를 받을 때 마다",
      "Weekly updates, when your karma is replenished" : "카르마가 보충되었을 때 주간 업데이트",
      "Edit" : "수정",
      "Offered Rewards" : "제공된 리워드",
      "You have sold" : "You have sold",
      "Owned Rewards" : "보유 리워드",
      "My Given Karma": "내가 준 카르마",
      "My Received Karma": "내가 받은 카르마",
      
      // Reward
      "Cost" : "비용",
      "Available" : "보상가능",
      "Description" : "설명",
      "Purchase" : "구입",

      // RewardForm
      "Invalid name" : "적절하지 않은 이름입니다.",
      "Invalid cost" : "적절하지 않은 비용입니다.",
      "Invalid quantity" : "적절하지 않은 수량입니다. ",
      "Reward creation failed" : "카르마 생성에 실패했습니다.",
      "Server error!" : "서버 오류!",
      "Server failure!" : "서버 이상!",
      "New Reward" : "새로운 리워드",
      "Name" : "이름",
      "Qty" : "개수",
      "Karma Flavor" : "카르마 Flavor",
      "Offer This Reward" : "이 리워드를 제안",
      
      // RewardRow
      "cost" : "비용",
      "available" : "보상가능",
      
      // Rewards
      "Available Rewards" : " 보상을 얻을 수 있는 리워드",
      "My Rewards" : "내 리워드",
      "Rewards you have offered" : "보상을 제안한 리워드",
      
      // Sign Out
      "Logging you out..." : "로그아웃중입니다.…",
      
      // Tranche
      "unknown" : "모르는 이",
      "you" : "당신은",
      "sent" : "보냈습니다.",
      "karma to" : "카르마를 에게",
      "at block" : "블럭에",
	    }
    },
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
