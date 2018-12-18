YKarma
======

YKarma is an experimental project to model reputation as a spendable currency.

The basic concept: every person in a community or organization is allotted 100
"karma coins" to distribute each week. These must be given away to other people
before they can be used. The recipients can then spend these coins on various
rewards (a day off, a conference ticket, a coffee with someone notable, etc.)

### What's the point?

1. Quantifying reputation makes it possible to build a real reputation economy.
That could benefit many people.

2. It's an experiment which could have a lot of interesting emergent properties.

### Giving people scores or ratings is a horrible idea! How can you say it would benefit people?

Giving people public scores or ratings, like China's new "social credit"
system or that Black Mirror episode, is indeed a dystopic concept. Fortunately
this is quite different. People don't have a persistent YKarma _score_, they
just have coins to spend in the notional reputation economy. If someone doesn't
have many, that doesn't indicate unpopularity; it could just mean they recently
spent theirs on a reward.

The general hope/notion is for people who excel in fields and communities which
don't see much in the way of monetary compensation -- poetry, art, music, open-
source software development, indie video games, nonprofits, churches, etc. --
to receive new rewards for their work. Since every participant receives coins
which must be given away, transactions are no longer zero-sum. People can be
recognized and rewarded without it costing the giving individuals anything ...
as long as rewards are available for people who accumulate enough karma.

### OK, but why would anyone make any valuable reward available for purchase with a reputation currency like this?

The most obvious and most boring use is within a company, wherein offering
employee rewards -- a day off, a course, a conference, a social event at
company expense, etc. -- would a) be good for morale, b) identify those people
most highly thought of by their fellow workers. In that case the company would
be the"vendor" of rewards for their employees.

It's also easy to envision why external vendors would want to offer rewards to
people who have established themselves as high-reputation within a particular
community. The immediate value for conferences etc. would be simply having them
present. The longer-term value would be establishing relationships with people
who are, definitionally, influential.

It could also make sense to offer "perishable inventory," e.g. empty hotel
rooms or airplane seats, as doing so within a reputation economy wouldn't
devalue that inventory's perceived monetary worth.

There may also be a concept of _brand_ reputation, wherein brands make goods or
services available in exchange for sizable amounts of YKarma, just as they comp
celebrities today. The amount of YKarma spent on competing brands could serve
as a proof and/or quantitative measure of their relative values.

It's also possible, crazy as it may sound, that some people might like to give
rewards away to strangers who have been shown to be deserving.

### But how can a single measure of reputation be meaningful across these different fields and communities?

It probably can't -- though, again, this is all very experimental! -- so when
coins are minted, they are "tagged" with the set of interests/fields for the
community in question, ranging from fairly specific ("Ethereum", "Consensys")
to somewhat generic ("blockchain", "open source") to very generic ("tech").
Then, when vendors make rewards available, they can require payment in karma
coins with a given tag -- "tech" coins to acquire tickets to a generic tech
conference, or "open source" coins for something more specific.

### Hang on. You're literally printing new money every week. Won't that lead to runaway inflation?

Sort of, but not really, and to the extent it's true, it's a feature not a bug.

When you spend karma, the money is destroyed (although see below) because
reputation is not really transferable, so money is also taken out of the
economy. And while it's true there'll likely be considerable inflation over
time if/as more people join, this is *deliberate*: YKarma is inflationary by
design. Like reputation itself, the real value of YKarma savings decay
steadily, making it difficult to hoard capital. That's one of the things
which makes a reputation economy very different from a monetary one.

(At one point I was going to build significant
[demurrage](https://en.wikipedia.org/wiki/Demurrage_(currency)) into the
system, but on reflection decided that wasn't needed, or at least not yet.)

### OK, I am cautiously amenable to the concept. So how does it work?

It's a web site backed by tokens on an Ethereum blockchain.

### Seriously? Blockchains are so 2017. Why a blockchain?

Because the ultimate idea is to build a decentralized, permissionless currency
which federates an arbitrary number of communities and users, and that is, it
seems, a mission which calls for some kind of blockchain.

That said: this is an experiment, and if it goes anywhere at all it will
presumably require a lot of tweaking, which, at least initially, can't really
be managed efficiently via consensus or voting.  So there'll be ongoing tension
between initial control of the experimental parameters and the end goal of
permissionlessness. It's on a blockchain, though, because that is the end goal.

### OK, but even granting the desire for an ultimately permissionless and hence blockchain solution, is Ethereum really the right platform?

It's the right platform right now. Maybe in some distant future it will be
migrated to a different one. But in the here and now, Ethereum is running,
battle-tested code with a maturing software toolset for its smart-contract
system, which is flexible and powerful enough for this experiment.

### But how can this possibly work on the Ethereum blockchain, with its high gas costs and low transaction bandwidth?

It can't. So this won't run on the public Ethereum mainnet, until / unless
that scales (eg via Plasma and/or sharding) massively beyond its current
limits. Instead it will run on a "consortium" / "proof of authority" Ethereum
blockchain, just like the Rinkeby testnet, with an eye towards one day
federating together multiple blockchains -- each supporting one or more
community -- as
[Ethermint zones](https://blog.cosmos.network/a-beginners-guide-to-ethermint-38ee15f8a6f4).

### All right. So who administers communities, tags, users, and vendors?

For now, the code is set up so there's a main smart contract, YKarma, which
handles most of the economy, and a separate administrative smart contract, the
YKOracle, which can manage communities, tags, and vendors.

Users must have at least one URL which identifies them -- currently either an
email address or a Twitter handle, but obviously many more options, ranging
from phone numbers to Keybase URLs to IPFS addresses. Coins are sent to
these URLs, meaning you can send coins to people who are not yet part of the
system and/or any of its communities. However, communities can restrict the
URLs their members' coins are sent to, so they can e.g. ensure that coins
only go to people with @company.com email addresses.

Users who never want to deal with the blockchain won't have to -- that's the
whole point of all the web code in this repo -- but users who want to become
"free agents" may do so at the cost of additional complexity.

Ultimately each individual community will validate its own users, vendors, and
which other communities they include in their reputation economy. In the very
long term I can envision networks of networks of federated communities.

### This is all getting pretty abstract. Can we talk concrete examples and scenarios?

Sure! Let's follow some coins through from genesis to expenditure.

Alice is a YKarma user; every Monday, she receives 100 YK (aka coins aka karma)
to give to others as she sees fit. One fine Monday, Alice decides she likes
Bob's latest essay on Medium, and sends him 10 YK from that pile. Note that
Alice can't spend it on rewards herself; YK has to be given away before it can
be spent.

Bob receives an email saying "Alice has sent you some karma!" (Obviously we
want to avoid spamming people, so that email is only sent once unless Bob opts
in to further notifications.) The email includes a link to the web site. If
he already has an account in Alice's community -- say, if someone already sent
his Twitter handle some karma -- then he can link his email to his Twitter
handle and add those 10 YK to his existing balance. Otherwise, he now has a
YKarma account with 10 YK in it.

Ten YK isn't very much. But next week, when Bob's essay goes viral, lots of
people in this community send him YK, and he winds up with a balance of 1000.
Meanwhile, Charlie, a popular community co-founder, has decided to become a
YKarma "vendor" and offer a "Charlie Buys You Dinner" reward to people in
the community, so as to keep up with influential people in it.

Bob logs back into YKarma, goes to the Rewards page, and uses his YK to
purchase the "Charlie Buys You Dinner" reward, partly for the free meal, partly
because he's always admired Charlie's work. The irrevocable ownership of that
reward is transferred from Charlie's vendor account to Bob's user account, and
then it's up to them to then arrange the dinner.

A note to decentralization devotees: this is all described as happening through
the YKarma site, because that is the easiest solution -- but behind the scenes,
this is all blockchain-based. Anyone can create an address on the blockchain,
receive "YKEther" from a tap, and directly create / interact with communities,
accounts, and vendors. This will obviously only be appealing to technically
sophisticated users / communities, but the possibility exists.

### What happens to coins after they're spent?

Currently they are gone forever, because we're modeling reputation, which isn't
really transferable, and because money has to leave the system <i>somehow</i>
or we'll have runaway inflation.

However one possible experimental notion is for e.g. 10% of the spent karma to
be retained by the vendor, because there is such a thing as proxy reputation.
This may be at the buyer's discretion, independent of the transaction
completing successfully -- i.e. you can always buy the reward, whether or not
you want to transfer some of the spent karma to the vendor. (Yes, this is yet
another significant divergence from traditional money.)

Furthermore, we track and display the total number of rewards a vendor has ever
sold, and the total karma they have received, as another form of reputation.
This is admittedly a "rating", but one still very different from e.g. "social
credit", and rating vendors as opposed to users seems a reasonable thing to do.

### What else is on the notional roadmap?

Lots of stuff, including:

* Rewards should be auctionable as well as fixed-price. That's obviously much
more complex to code, though, so it's not yet implemented.

* Karma used for governance / voting; people who want to bring forth a proposal
to a community must spend X karma to do so, where X is dissuasive but not
preventative, and then the entire community can spend karma as votes, with Z
net votes in favor required to pass. Interesting, but again, complex.

* I'd also like to implement a "vouching" system wherein communities can agree
on new members, eg "5 existing members much vouch for you before you can become
a member and start giving out karma yourself." One could also limit by domain,
e.g. "only email addresses which end in @company.com can be added." For the
alpha test, anyone who is sent karma becomes part of the "alpha test" community. 

* In a better world the web site would be less janky (the interactions between
React, Firebase, and the blockchain's relatively slow read times make the site
behavior and performance ... suboptimal) and would look-and-flow much less like
it was designed by an engineer.

### Will there be an ICO?

You're kidding, right?

### I'm a developer. Tell me about the tech stack and what I would need to do to get it up and running?

You want the [project HOWTO](./HOWTO.md).

### Tell me more about the larger vision/purpose here?

You want the [project MANIFESTO](./MANIFESTO.md).

### So what happens next?

That's slightly unclear. Right now I just want to get the code into a stable
and reliable state, and I _think_ it's ready for alpha testing. Which means it
probably isn't, but that's the chance that alpha testers take. So, most
immediately, I'm looking for volunteers to take part in that testing.

I'm also interested in talking to people who find the concept intriguing,
whether they be potential collaborators, parallel experimenters, angry critics,
or anything else. If you're any of those, please feel free to reach out to me
at info@ykarma.com to converse privately, or @rezendi on Twitter to discuss
publicly.

### Why is it called "YKarma"?

Mostly because the domain contained the word "karma" and was available.
