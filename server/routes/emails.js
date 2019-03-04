const util = require('./util');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendKarmaSentEmail(sender, recipientEmail, amount, message, hasNeverLoggedIn) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = recipientEmail.replace("mailto:","");
  if (recipientEmail.indexOf("@") < 0) {
    util.warn("Unable to send email to", recipientEmail);
  }
  const messageText = message ? `, with the message: ${message}` : '';
  const messageHtml = message ? `, with the message: <i>${message}</i>` : '';
  const dontWorry = hasNeverLoggedIn ? `
(Don't worry, we don't want to spam you; you won't get emails about ${sender} sending you YKarma again unless you choose to log in.)
` : `
(Don't like getting these emails? You can control your email settings on your YKarma profile page.)
`;
  const msg = {
    to: recipientEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `${sender} just sent you ${amount} YKarma!`,
    text: `
Hello! You were just sent ${amount} YKarma by ${sender}${messageText}.
You should log into https://www.ykarma.com/ to find out more and/or use this karma to purchase rewards.
${dontWorry}
YKarma
https://www.ykarma.com/
`,
    html: `
<p>Hello! You were just sent <b>${amount}</b> YKarma by <b>${sender}</b>${messageHtml}.</p>
<p>You should <a href="https://www.ykarma.com/login">log in to YKarma</a> to find out more and/or use this karma to purchase rewards.</p>
<p>${dontWorry}</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>

`,
  };
  sgMail.send(msg);  
}

function sendRewardCreatedEmail(vendor, reward) {
  util.debug("Sending created email to", vendor ? vendor.urls : 'n/a');
  if (process.env.NODE_ENV === "test") return;
  var vendorEmail = util.getEmailFrom(vendor.urls);
  if (vendorEmail === "") return;
  const msg = {
    to: vendorEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just created a reward!`,
    text: `
You just created the reward ${getRewardInfoFrom(reward)}
Well done! Your community thanks you.

YKarma
https://www.ykarma.com/
`,
    html: `
<p>You just created the reward ${getRewardInfoFrom(reward)}</p>
<p>Well done! Your community thanks you.</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);  
}

function sendRewardSoldEmail(reward, buyer, vendor) {
  util.debug("Sending selling email to", vendor.urls);
  if (process.env.NODE_ENV === "test") return;
  var vendorEmail = util.getEmailFrom(vendor.urls);
  if (vendorEmail === "") return;
  var buyerInfo = util.getEmailFrom(buyer.urls);
  if (!buyerInfo) {
    buyerInfo = buyer.urls ? buyer.urls.split(util.separator)[0] : 'n/a';
  }
  const msg = {
    to: vendorEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just sold a reward!`,
    text: `
Your reward ${getRewardInfoFrom(reward)}
was just sold to ${buyerInfo}
You should connect with them to give them the reward!

YKarma
https://www.ykarma.com/
`,
    html: `
<p>Your reward <b>${getRewardInfoFrom(reward)}</b></p>
<p>was just sold to <b>${buyerInfo}</b></p>
<p>You should connect with them to give them the reward!</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);
}

function sendRewardPurchasedEmail(reward, buyer, vendor) {
  if (process.env.NODE_ENV === "test") return;
  var buyerEmail = util.getEmailFrom(buyer.urls);
  if (buyerEmail === "") return;
  var vendorInfo = util.getEmailFrom(vendor.urls);
  if (!vendorInfo) {
    vendorInfo = vendor.urls ? vendor.urls.split(util.separator)[0] : 'n/a';
  }
  const msg = {
    to: buyerEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just bought a reward!`,
    text: `
You just purchased the reward ${getRewardInfoFrom(reward)}
from vendor ${vendorInfo}
You should connect with them to claim the reward!

YKarma
https://www.ykarma.com/
`,
    html: `
<p>You just purchased the reward <b>${getRewardInfoFrom(reward)}</b></p>
<p>from vendor <b>${vendorInfo}</b></p>
<p>You should connect with them to claim the reward!</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);
}

function getRewardInfoFrom(reward) {
  const metadata = reward.metadata ? reward.metadata : {'name':'n/a', 'description':'n/a'};
  return `${metadata.name} -- ${metadata.description} (id: ${reward.id}, cost: ${reward.cost})`;
}

module.exports = {
  sendKarmaSentEmail:       sendKarmaSentEmail,
  sendRewardCreatedEmail:   sendRewardCreatedEmail,
  sendRewardSoldEmail:      sendRewardSoldEmail,
  sendRewardPurchasedEmail: sendRewardPurchasedEmail, 
};