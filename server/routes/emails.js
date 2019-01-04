const util = require('./util');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendKarmaSentEmail(sender, recipientEmail, amount, message) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = recipientEmail.replace("mailto:","");
  if (recipientEmail.indexOf("@") < 0) {
    util.warn("Unable to send email to", recipientEmail);
  }
  const msg = {
    to: recipientEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `${sender} just sent you ${amount} YKarma!`,
    text: `
Hello! You were just sent ${amount} YKarma by ${sender}, with the message: ${message}.
You should log into https://www.ykarma.com/ to find out more and/or use this karma to purchase rewards.
(Don't worry, we don't want to spam you; you won't get emails about ${sender} sending you YKarma again unless you choose to log in.)

YKarma
https://www.ykarma.com/
`,
    html: `
<p>Hello! You were just sent <b>${amount}</b> YKarma by <b>${sender}</b>, with the message: <i>${message}</i>.</p>
<p>You should <a href="https://www.ykarma.com/">log in to YKarma</a> to find out more and/or use this karma to purchase rewards.</p>
<p>(Don't worry, we don't want to spam you; you won't get emails about ${sender} sending you YKarma again unless you choose to log in.)</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>

`,
  };
  sgMail.send(msg);  
}

function sendRewardCreatedEmail(vendor, reward) {
  util.debug("Sending created email to", vendor.urls);
  if (process.env.NODE_ENV === "test") return;
  var vendorEmail = getEmailFrom(vendor.urls);
  if (vendorEmail === "") return;
  const msg = {
    to: vendorEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just created a reward!`,
    text: `
You just created the reward ${JSON.stringify(reward)}
Well done! Your community thanks you.

YKarma
https://www.ykarma.com/
`,
    html: `
<p>You just created the reward ${JSON.stringify(reward)}</p>
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
  var vendorEmail = getEmailFrom(vendor.urls);
  if (vendorEmail === "") return;
  const msg = {
    to: vendorEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just sold a reward!`,
    text: `
Your reward ${JSON.stringify(reward)}
was just sold to ${JSON.stringify(buyer.urls)}
You should connect with them to give them the reward!

YKarma
https://www.ykarma.com/
`,
    html: `
<p>Your reward ${JSON.stringify(reward)}</p>
<p>was just sold to ${JSON.stringify(buyer.urls)}</p>
<p>You should connect with them to give them the reward!</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);
}

function sendRewardPurchasedEmail(reward, buyer, vendor) {
  if (process.env.NODE_ENV === "test") return;
  var buyerEmail = getEmailFrom(buyer.urls);
  const msg = {
    to: buyerEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `You just bought a reward!`,
    text: `
You just purchased the reward ${JSON.stringify(reward)}
from vendor ${JSON.stringify(vendor.urls)}
You should connect with them to claim the reward!

YKarma
https://www.ykarma.com/
`,
    html: `
<p>You just purchased the reward ${JSON.stringify(reward)}</p>
<p>from vendor ${JSON.stringify(vendor.urls)}</p>
<p>You should connect with them to claim the reward!</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);
}

function getEmailFrom(urls) {
  if (urls && urls.indexOf("mailto") >= 0) {
    const urlArray = urls.split("||");
    for (var i in urlArray) {
      if (urlArray[i].startsWith("mailto:")) {
        return urlArray[i].replace("mailto:","");
      }
    }
  }
  return '';
}

module.exports = {
  sendKarmaSentEmail:       sendKarmaSentEmail,
  sendRewardCreatedEmail:   sendRewardCreatedEmail,
  sendRewardSoldEmail:      sendRewardSoldEmail,
  sendRewardPurchasedEmail: sendRewardPurchasedEmail, 
};