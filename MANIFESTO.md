
The YKarma Manifesto
====================

25 Theses Regarding an Experimental Performance-Art Reputation Cryptocurrency
-----------------------------------------------------------------------------

1. Ten years ago the person(s) known as Satoshi Nakamoto introduced a novel
solution to the Byzantine Generals Problem, one which can be used to
implement secure, permissionless online currencies. Since then, however,
cryptocurrencies have almost exclusively been used to recapitulate existing
monetary systems in slightly new forms.

2. This is boring.

3. Programmable money gives us the ability to build whole new _categories_
of economies, ones which reject all traditional assumptions about how value
is generated, transferred, or stored.

4. YKarma is an example of such an experiment: one which quantifies reputation
as a spendable currency within a gift economy. By design, its currency has zero
monetary value; is minted and airdropped to all users every week; is worthless
until given to another user; is destroyed rather than transferred when spent;
and implicitly decays in value as its network scales.

5. YKarma is also an example of software as performance art. It is a truth
universally acknowledged that a blockchain should only be used to store
dense, high-value information such as hashes, URLs, and account allocations.
YKarma, by contrast, makes a point of using its blockchain as its _only_
datastore.

6. This was, to drily understate, not done for the sake of efficiency. I would
estimate this as having taken 10x more development time than it would have
using a basic database, except I suspect the real number is more like 20x when
configuration / devops are taken into account. Its performance is similarly at
least that much worse.

7. While this was all devised with tongue in cheek, it was also written with
(some) serious intent. As we reach the point of diminishing and/or negative
returns to traditional capitalism, alternative economic structures will grow in
importance. Such structures will almost certainly include reputation economies.

8. Please note: reputation _economies_, i.e. modeling reputation as a spendable
currency, not, repeat not, reputation _systems_, i.e. some kind of "social
credit rating." The former is an interesting idea worthy of experimentation.
The latter is a dystopia waiting to happen. The two are _very_ different.

9. YKarma is intended both as an implementation of a single, potentially
useful flavor of an experimental reputation economy, and as an open-source
example of an end-to-end, web-to-Ethereum-blockchain, fairly complex system,
to be forked / mutated / built upon by others.

10. Let a thousand weird cryptoflowers bloom!

11. For details on how it works, see the [project README](./README.md).

12. For technical details regarding how to clone/run YKarma locally, see the
[project HOWTO](./HOWTO.md).

13. Running it on the public Ethereum mainnet would be punitively expensive,
due to its data storage requirements, and also impossible, due to its sheer
number of transactions, if it were to scale at all. As such it currently runs
on a private Proof-of-Authority blockchain.

14. The eventual intent is for each community to run its private chain as an
[Ethermint zone](https://blog.cosmos.network/a-beginners-guide-to-ethermint-38ee15f8a6f4)
(or equivalent, on some other pan-chain system), and for each community to
decide on the other chains, if any, with which they want to federate their
reputations.

15. Another goal is to preserve the privacy of account balances, using SNARKs
or what have you, to ensure that this reputation currency is not used as a
reputation rating.

16. That is of course all very handwavey, but it seems likely that in a year or
two it will be technically feasible.

17. Weird performance-art experiments are all well and good, but they're even
better if they're actually useful. Conveniently, I can at least conceive of a
world in which people actually use this one.

18. Before we get into that, let me stress: what I'd _really_ like to see is a
wave of experimentation with wholly new economic structures and incentivization
systems. This is something which blockchains enable, but which has not yet
happened, largely because (most) people cannot think outside the box in which
they live, and/or are more interested in getting rich in the cryptocurrency casino
or building decentralized versions of existing centralized services.

19. This isn't to reject capitalism, by the way. Well-regulated capitalism is
great, up to a point, one which I think we in the rich world have now hit. Even
if you don't think it's great, it's not going anywhere. Whatever supplants
capitalism will not violently overthrow it in some kind of dramatic post-
capitalist revolution; it will subvert from within.

20. Anyway. The fundamental sticking point for many people, I expect, will be
that YKarma isn't just a reputation economy but a reputation _gift_ economy. It
relies on people creating and offering rewards, else there will be nothing on
which to spend the reputation currency. However, one of its major differences
from capitalism as we know it is that, when spent, the currency is _burnt_ i.e.
taken out of the economy forever, rather than being transferred to the vendor.
Yes, you read that correctly.

21. You may ask: who would create a worthwhile reward when they will not
receive the currency that is paid for it?

22. As tempting as it is to go all woo-woo Burning Man on you, that question
actually has many sober and prosaic answers. Companies offering rewards to
their employees; nonprofits offering rewards to their volunteers; gatherings
offering free attendance or benefits to people whose presence would burnish
their own public image; individuals offering a free lunch in exchange for
meeting and picking the brains of high-reputation people; altruists offering
gifts to those collectively deemed most deserving; hosts offering couchsurfing
to particularly interesting people; brands offering freebies to very-high-
reputation people, just as they do today, except quantified; etc etc etc.

23. Whether people will want to participate in a given reputation currency
depends mostly on incentives. If the perceived rewards are valuable enough,
and/or the community is important enough to them, then they will participate.
That said, the complexity, design, and user experience of the currency will, as
ever, be extremely important factors in its adoption or lack thereof.

24. I'm interested in talking to people who find the concept intriguing,
whether they be potential collaborators, parallel experimenters, angry critics,
or anything else. If you're any of those, please feel free to reach out to me
at info@ykarma.com to converse privately, or @rezendi on Twitter to discuss
publicly.

25. This I believe: every Git repo should include a MANIFESTO.md.
