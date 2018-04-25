YKarma
======

YKarma is an experimental project to model reputation as a spendable Ethereum token.

The basic concept: every person in a community or organization is allotted 100 "YKarma coins"
every week, to give away to other people in that community. After they're given, the recipients
can spend these coins on various rewards. (A day off, a conference ticket, etc.) Received coins
lose half of their value every four months, though, so, like reputation itself, YKarma savings
decay rapidly over time. That makes this reputation economy *very* different from a monetary one,
in that it's impossible to hoard capital, and also prevents the "money supply" from hyperinflation.

### What's the point?

1. Quantifying reputation makes it possible to build an real reputation economy. That would benefit many people.
2. It's an experiment which could have a lot of interesting emergent properties.

### Giving people scores or ratings is a horrible idea! How can you say it would benefit people?

Giving people scores or ratings, like China's new "social credit" system, is indeed a terrible
dystopic notion. Fortunately this is quite different. People don't have a persistent YKarma
*score*, they just have coins to spend in the notional reputation economy. If someone doesn't
have many, that doesn't mean they're unpopular, it might just mean they spent theirs recently.

The general hope is more for people who excel in fields and communities which don't see much
in the way of monetary compensation -- poetry, art, music, open-source software development,
indie video games, nonprofits, churches, etc. -- to receive a new kind of reward, which is
non-zero-sum because every participant gets coins to give away (and which cannot be used until
they have been given away.) And, of course, for this reward to be actually useful.

### But how can a single measure of reputation be valid across these different fields and communities?

It probably can't (though, again, this is all very experimental!) so when coins are given,
they can be "tagged" with relevant communities, ranging from fairly specific ("Ethereum",
"open source") to less specific ("blockchain", "Consensys") to generic ("tech"). Then, when
vendors make rewards available, they can require coins with a certain tag(s) -- for instance,
"tech" coins to acquire tickets to a generic tech conference, "Ethereum" coins for a more
specific Ethereum conference.

### Why would anyone exchange valuable things like conference tickets for YKarma?

The most obvious use is within a company, wherein employee rewards like a day off, or a
social event at the company's expense,  would be a) good for morale, b) identify those
people most highly thought of by their fellow employees. In that case the company would
be the "vendor" for their employees.

It's also easy to envision, though, why external vendors would want to offer rewards
to people who have established themselves as high-reputation within a particular community.
The immediate value for conferences etc. would be simply having them present; the longer-term
value would be establishing a relationship with people whose decisions will presumably have
outsized significance in time to come. It might also make sense to offer them "perishable
inventory," eg empty hotel rooms or airplane seats; doing so within a reputation economy
wouldn't devalue that inventory's perceived monetary worth.

There may also be a concept of *brand* reputation, but that's still notional / experimental.

### OK, I am cautiously amenable to the concept. But why is it on a blockchain?

An actual reputation economy / currency must be usable by anyone, without having to ask
permission. That's what a blockchain offers. A certain amount of gatekeeping will be
required -- the on-ramps to the reputation economy must be watched, basically. More on
that below. But once a user or vendor is established as a participant, they have to be
free to use or build atop the platform without requiring the approval of some central controller.

Now that we've gotten that stirring call to arms out of the way: this is an experiment
and if it goes anywhere at all it will presumably require a lot of tweaking, which, at
least initially, can't really be managed in an efficient manner via consensus or voting.
Furthermore, participants must be verified as actual people, or the whole economy will
be fatally vulnerable to sockpuppets/bots. So there'll be ongoing tension between
initial control of the experiment and the ultimate end goal of permissionlessness. It's
on a blockchain, though, because that is the ultimate end goal.

### But how can this possibly work on the Ethereum blockchain, with its high gas costs and low transaction limits?

It can't. So this won't run on the public Ethereum mainnet, until / unless that scales
(eg via Plasma) massively beyond its current limits. Instead it will run on a "consortium"
/ "proof of authority" Ethereum blockchain, just like the Rinkeby testnet. For now the
consortium is, er, me, but the hope/idea is to add more nodes in the future.

### OK, but even granting the desire for an ultimately permissionless and hence blockchain solution, is Ethereum really the right blockchain?

Probably not. Probably a custom blockchain would be much better. Maybe in some distant
future YKarma will be migrated to the YKarma blockchain. But in the here and now,
Ethereum is running, battle-tested code with a maturing software toolset for its
smart-contract system, which is flexible and powerful enough for this experiment, so
we'll use it. It's a kludge, don't get me wrong, but a highly expedient one.

### All right. So who administers communities, tags, users, and vendors?

For now, the code is set up so there's a main smart contract, YKarma, which handles most
of the economy, and a separate administrative smart contract, the YKOracle, which can manage
communities, tags, and vendors. The idea is that multiple YKOracles will exist in the future,
ideally elected by some form of community voting, again so that while there will be
gatekeeping there won't be a single point of control.

Users must have an email address, a telephone number, or ideally both. Coins are sent to URLs
rather than Ethereum addresses, meaning you can send coins to people who are not yet part of
the system and/or any community. However communities can restrict the URLs their coins are
sent to (e.g. ensure that coins only track reputation within a company.)

Users who never want to deal with the blockchain won't have to, but users who want to become
"free agents," and/or to combine their accounts from multiple communities, may do so at the
cost of additional complexity. Communities "nominate" users (i.e. email/telephone URLs) to
become members; the YKOracle can either "approve" users (presumably after text/email
verification) or name the community "trusted," i.e. able to add new users at will.

### This is all getting pretty abstract. Can we talk concrete examples and scenarios?

Sure! Let's follow some coins through from genesis to expenditure.

(TODO)

### What happens to coins after they're spent?

Current thinking is that they're gone forever, because we're modeling reputation, which
isn't really transferable. However a possible notion is for a small fraction e.g. one-eighth
of the coins to be retained by the vendor, because there is such a thing as proxy reputation.
Another is to track the total number of coins a vendor has ever received, which is another
form of reputation. (This is arguably a "score," of sorts, but one with many many confounds
compared to e.g. "social credit", and also scoring vendors seems a reasonable thing to do.)

### Why is it called "YKarma"?

Mostly because the domain was available.
