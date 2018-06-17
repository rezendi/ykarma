YKarma
======

YKarma is an experimental project to model reputation as a spendable Ethereum token.

The basic concept: every person in a community or organization is allotted 100
"karma" to distribute each week, which must be given away to other people before they
can be used. The recipients can then spend these "karma coins," which serve as a measure
of their reputation, on various rewards (a day off, a conference ticket, etc.)

### What's the point?

1. Quantifying reputation makes it possible to build a real reputation economy. That could benefit many people.
2. It's an experiment which could have a lot of interesting emergent properties.

### Giving people scores or ratings is a horrible idea! How can you say it would benefit people?

Giving people public scores or ratings, like China's new "social credit" system or that
Black Mirror episode, is indeed a dystopic concept. Fortunately this is quite different.
People don't have a persistent YKarma *score*, they just have coins to spend in the
notional reputation economy. If someone doesn't have many, that doesn't indicate
unpopularity; it could well just mean they spent theirs on a reward recently.

The general hope/notion is for people who excel in fields and communities which don't
see much in the way of monetary compensation -- poetry, art, music, open-source software
development, indie video games, nonprofits, churches, etc. -- to receive new rewards for
their work. Since every participant receives coins which must be given away, transactions
are no longer zero-sum. People can be recognized and rewarded without it costing the
giving individuals anything ... as long as rewards are available for people who
accumulate enough karma.

### OK, but why would anyone exchange any valuable reward for a reputation currency like this?

The most obvious use is within a company, wherein employee rewards like a day off,
a course, a conference, or a social event at company expense, would a) be good for
morale, b) identify those people most highly thought of by their fellow workers. In
that case the company would be the "vendor" of rewards for their employees.

It's also easy to envision why external vendors would want to offer rewards to people
who have established themselves as high-reputation within a particular community. The
immediate value for conferences etc. would be simply having them present. The longer-term
value would be establishing relationships with people who are, definitionally,
influential. It would also make sense to e.g. offer them "perishable inventory," e.g.
empty hotel rooms or airplane seats, as doing so within a reputation economy wouldn't
devalue that inventory's perceived monetary worth.

There may also be a concept of *brand* reputation, wherein brands make goods or services
available in exchange for sizable amounts of YKarma, just as they comp celebrities today.
The amount of YKarma spent on competing brands could then serve as a proof and/or
quantitative measure of their relative values.

### But how can a single measure of reputation be meaningful across these different fields and communities?

It probably can't (though, again, this is all very experimental!) so when coins are
given, they can be "tagged" with relevant communities, ranging from fairly specific
("Ethereum", "open source", "blockchain", "Consensys") to very generic ("tech"). Then,
when vendors make rewards available, they can require coins with a certain tag(s) -- for
instance, "tech" coins to acquire tickets to a generic tech conference, "Ethereum" coins
for a more specific conference.

### Hang on. You're literally printing new money every week. Won't that lead to runaway inflation?

Sort of, but this is a feature, not a bug.

When you spend karma, the money vanishes (at least mostly -- see below) because
reputation is not really transferrable, so money is also taken out of the reputation
economy. And while it's true there'll likely be considerable inflation over time, and
if/as more people join, this is *deliberate*; YKarma is inflationary by design. Like
reputation itself, the real value of YKarma savings decay steadily, making it difficult
to hoard capital. That's one of the things thing which makes a reputation economy very
different from a monetary one.

### OK, I am cautiously amenable to the concept. But why is it on a blockchain?

An actual reputation economy / currency must be usable by anyone, without having to ask
permission. That's what a blockchain offers. A certain amount of gatekeeping will be
required -- the on-ramps to the reputation economy must be watched -- but once a user
or vendor is established as a participant, they have to be free to use or build atop
the platform without requiring the approval of some central controller, or they will
never choose to do so.

Now that we've gotten that stirring speech out of the way: this is an experiment,
and if it goes anywhere at all it will presumably require a lot of tweaking, which, at
least initially, can't really be managed in an efficient manner via consensus or voting.
Furthermore, participants must be verified as actual people, or the whole economy will
be fatally vulnerable to sockpuppets/bots. So there'll be ongoing tension between
initial control of the experimental parameters and the end goal of permissionlessness.
It's on a blockchain, though, because that is the ultimate end goal.

### OK, but even granting the desire for an ultimately permissionless and hence blockchain solution, is Ethereum really the right platform?

Probably not. Probably a custom blockchain would be much better. Maybe in some distant
future YKarma will be migrated to the YKarma blockchain. But in the here and now,
Ethereum is running, battle-tested code with a maturing software toolset for its
smart-contract system, which is flexible and powerful enough for this experiment, so
we'll use it. It's a kludge, don't get me wrong -- see also the next question -- but
it's a highly expedient one.

### But how can this possibly work on the Ethereum blockchain, with its high gas costs and low transaction bandwidth?

It can't. So this won't run on the public Ethereum mainnet, until / unless that scales
(eg via Plasma and/or sharding) massively beyond its current limits. Instead it will
run on a "consortium" / "proof of authority" Ethereum blockchain, just like the Rinkeby
testnet. For now the consortium is, er, me, but the hope/idea is to add more nodes in
the future.

### All right. So who administers communities, tags, users, and vendors?

For now, the code is set up so there's a main smart contract, YKarma, which handles most
of the economy, and a separate administrative smart contract, the YKOracle, which can
manage communities, tags, and vendors. The idea is that multiple YKOracles will exist in
the future, ideally elected by some form of community voting, so that while there will be
gatekeeping, there won't be a single point of control.

Users must have at least one URL which identifies them -- an email address, a telephone
number, a Keybase ID, a social media handle, or, ideally, some combination. Coins are
sent to URLs rather than Ethereum addresses, meaning you can send coins to people who are
not yet part of the system and/or any of its communities. However, communities can
restrict the URLs their members' coins are sent to, so they can e.g. ensure that coins
only go to people with @company.com email addresses.

Users who never want to deal with the blockchain won't have to; but users who want to
become "free agents," and/or to combine their accounts from multiple communities, may do
so at the cost of additional complexity. Communities "nominate" URLs (e.g. email
addresses or phone numbers) to become members; the YKOracle then approves them
(or auto-approves nominations from trusted communities.)

### This is all getting pretty abstract. Can we talk concrete examples and scenarios?

Sure! Let's follow some coins through from genesis to expenditure.

Alice is a YKarma user; every Monday, she receives 100 YK (aka coins, aka karma) to
give away as she sees fit. One fine Monday, Alice decides she likes Bob's latest
essay on Medium, and sends him 10 YK from that pile. Note that Alice can't spend
it on rewards herself; YK has to be given away first before it can be spent.

Bob receives an email saying "Alice has sent you some karma!" (Obviously we want to
avoid spamming people so that email is only sent once unless Bob opts in to further
notifications.) The email includes a link to log in to YKarma. If he already has an
account in Alice's community -- say, if someone already sent his Twitter handle some
karma -- then he can link his email to his Twitter handle and add those 10 YK to
his existing balance. Otherwise he now has a YKarma account with 10 YK in it.

10 YK isn't very much. But next week, when Bob's essay goes viral, lots of people
in this community send him YK, and he winds up with a balance of 1000. Meanwhile,
Charlie, a popular community co-founder, has decided to become a YKarma "vendor"
and offer "Charlie Buys You Dinner" reward to people in this community, to keep
up with influential people in it. Bob logs back into YKarma, goes to his Community
Rewards page, and uses his YK to purchase the "Charlie Buys You Dinner" reward,
partly for the free meal, partly because he's always admired Charlie's work.

The irrevocable ownership of that reward is transferred from Charlie's vendor
account to Bob's user account, and it's up to them to then arrange the dinner.
Bob could instead decide to hoard his coins in the hopes of saving up for a
more valuable / expensive reward ... but he knows (and it's clearly displayed
to him on the YKarma site) that those 1000 karma will decay to 500 karma four
months from now, and 250 karma four months after that, etc.

A note to decentralization devotees: this is all described as happening through
the YKarma site because that is the easiest solution -- but behind the scenes,
this is all blockchain-based. Anyone can create an address on the blockchain,
receive "YKEther" from a tap, and directly create / interact with communities,
accounts, and vendors. This is obviously only going to be appealing to very
technically sophisticated users / communities, but the possibility exists.

### What happens to coins after they're spent?

Current thinking is that they're gone forever, because we're modeling reputation, which
isn't really transferable. However a possible notion is for a small fraction e.g. one-
eighth of the karma to be retained by the vendor, because there is such a thing as proxy
reputation. This may be at the buyer's discretion independent of the transaction
completing successfully -- i.e. you can always buy the reward whether or not you want to
transfer some of the karma in question to the vendor.

Another option is to track the total number of coins a vendor has ever received, which is
another form of reputation. This is arguably a "score," of sorts, but one with many many
confounds compared to e.g. "social credit", and also scoring vendors seems a reasonabl
thing to do.

It's probably worth noting that the intent is for rewards to be auctioned as well as
fixed-price, but for now they're fixed-price only, for obvious code complexity reasons.

### Will there be an ICO?

You're kidding, right?

### Why is it called "YKarma"?

Mostly because the domain contained the word "karma" and was available.
