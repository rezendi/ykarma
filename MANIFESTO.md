
The YKarma Manifesto
====================

1. Ten years ago the person(s) known as Satoshi Nakamoto introduced a novel
solution to the Byzantine Generals Problem which can be used to implement
secure, permissionless online currencies. Since then, cryptocurrencies have
mostly been used to recapitulate existing monetary systems.

2. This is boring.

3. Programmable money gives us the ability to build whole new _categories_
of economies, ones which reject all traditional assumptions about how value
is generated, transferred, or stored.

4. YKarma is an example of such an experiment: one which quantifies reputation
as a spendable currency within a gift economy. By design, its currency has zero
monetary value; is minted and airdropped to all users every week; is worthless
until given to another user; is destroyed rather than transferred when spent;
and implicitly decays in value as its network scales.

5. For details on how it works, see the [project README](./README.md).

6. YKarma is also an example of software as performance art. It is a truth
universally acknowledged that a blockchain should only be used to store hashes,
account allocations, and other high-value, densely packed information, and
must not be used to store inessential or low-value data. YKarma, by contrast,
makes a point of using its blockchain as its _only_ datastore, aside from the
use of Firebase for web authentication.

7. This was, to understate, not done for the sake of development or
implementation efficiency. I would estimate this as having taken 10x more time
than it would have using a database back end, except I suspect the real number
is more like 20x when configuration / devops are taken into account, and its
performance is similarly at least that much worse.

8. While it was devised with tongue in cheek, it was also written with (some)
serious intent. As we reach the point of diminishing and/or negative returns to
traditional capitalism, alternative economic structures will grow in
importance. Such structures will almost certainly include reputation economies.

9. Please note: reputation _economies_, i.e. modeling reputation as a spendable
currency, not, repeat not, reputation _systems_, i.e. some kind of "social
credit rating." The former is an interesting idea worthy of experimentation.
The latter is a dystopia waiting to happen. The two are _very_ different.

10. As such, YKarma is intended both as an implementation of a single
potentially useful flavor of an experimental economy, and an open-source
example of an end-to-end, web-to-Ethereum-blockchain, fairly complex system,
to be forked / built upon by others.

11. Let a thousand weird cryptoflowers bloom!

12. For technical details regarding how to clone/run YKarma locally, see the
[project HOWTO](./HOWTO.md).

13. Running it on the public Ethereum mainnet blockchain would be punitively
expensive, due to its data storage requirements, and also impossible, due to
its sheer number of transactions, if it were to scale at all. As such it
currently runs on a private Proof-of-Authority blockchain.

14. The vague eventual intent, however, is for each YKarma community to run
its own private chain as an
[Ethermint zone](https://blog.cosmos.network/a-beginners-guide-to-ethermint-38ee15f8a6f4)
(or equivalent, on some other pan-chain system), and for each community to
decide the other chains, if any, with which they want to federate their
reputations.

15. And also to preserve the privacy of account balances, using SNARKs or what
have you, to ensure that this reputation currency is not used as a reputation
rating.

16. That is of course all very handwavey, but it seems likely that in a year or
two it will be technically feasible.

17. Weird performance-art experiments are all well and good, but they're even
better if they're actually useful. Conveniently, I can at least conceive of a
world in which people actually use this one.

18. But before we get into that let me stress that what I'd _really_ like to
see is a wave of experimentation with wholly new economic structures and
incentivization systems. This is something which blockchains enable, but which
has not yet happened, largely because (most) blockchainers are more interested
in getting rich in the cryptocurrency casino, and/or building decentralized
versions of successful centralized services, rather than fundamental economic
experimentation.

19. This isn't to reject capitalism, by the way. Well-regulated capitalism is
great, up to a point, one which I think we in the rich world have now hit. Even
if you don't think it's great, it's not going anywhere. Whatever supplants
capitalism is not going to violently overthrow it in some kind of dramatic
post-capitalism revolution; it's going to subvert from within.

20. Anyway. The fundamental sticking point for many people, I think, will be
that this isn't just a reputation economy but a reputation _gift_ economy. It
relies on people creating and offering rewards, else there will be nothing to
spend the reputation currency on. However, one of its major differences from
capitalism as we know it is that, when spent, the currency is burnt / taken
out of the economy forever, rather than being transferred to the vendor. Yes,
you read that correctly.

21. You may ask: who would create a worthwhile reward when they will not
receive the currency that is paid for it? Who indeed.

22. As tempting as it is to go all woo-woo Burning Man on you, that question
actually has many sober and boring answers.


* This I believe: every Git repo should include a MANIFESTO.md.

* I had hoped to reach a full sacrilegious 95 theses, but it turns out 95 is a
very large number in this context.
