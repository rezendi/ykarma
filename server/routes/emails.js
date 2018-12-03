const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendKarmaSentEmail(sender, recipient, amount) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = recipient.replace("mailto:","");
  // TODO check that the URL is an email address
  const msg = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `${sender} just sent you ${amount} YKarma!`,
    text: 'You should totally find out more!',
    html: '<strong>You should totally find out more.</strong>',
  };
  sgMail.send(msg);  
}

function sendRewardCreatedEmail(vendor, reward) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = vendor.replace("mailto:","");
  // TODO check that the URL is an email address
  const msg = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `You just created a reward!`,
    text: `You should totally find out more! ${JSON.stringify(reward)}`,
    html: `<strong>You should totally find out more.</strong> ${JSON.stringify(reward)}`,
  };
  sgMail.send(msg);  
}

function sendRewardSoldEmail(vendor, reward) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = "";
  if (vendor.urls && vendor.urls.indexOf("mailto") > 0) {
    const urls = vendor.urls.split("||");
    for (var url in urls) {
      if (url.startsWith("mailto:")) {
        recipientEmail = url.replace("mailto:","");
      }
    }
  }
  if (recipientEmail === "") return;
  const msg = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `You just sold a reward!`,
    text: `You should totally find out more! ${JSON.stringify(reward)}`,
    html: `<strong>You should totally find out more.</strong> ${JSON.stringify(reward)}`,
  };
  sgMail.send(msg);
}

function sendRewardPurchasedEmail(purchaser, reward) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = purchaser.replace("mailto:","");
  const msg2 = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `You just bought a reward!`,
    text: `You should totally find out more! ${JSON.stringify(reward)}`,
    html: `<strong>You should totally find out more.</strong> ${JSON.stringify(reward)}`,
  };
  sgMail.send(msg2);
}

module.exports = {
  sendKarmaSentEmail:       sendKarmaSentEmail,
  sendRewardCreatedEmail:   sendRewardCreatedEmail,
  sendRewardSoldEmail:      sendRewardSoldEmail,
  sendRewardPurchasedEmail: sendRewardPurchasedEmail, 
};