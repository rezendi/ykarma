
The YKarma Manifesto
====================

1. Ten years ago the entity known as Satoshi Nakamoto introduced a novel
solution to the Byzantine Generals Problem, which can be used to implement
secure, permissionless online currencies. Since then, cryptocurrencies have
mostly been used to recapitulate existing monetary systems.

2. This is boring.

3. Programmable money gives us the ability to build whole new _kinds_ of
currencies, ones which reject all traditional assumptions about how value is
generated, transferred, or stored.

4. YKarma is an example of such an experiment, one which quantifies reputation
as a spendable currency within a gift economy. By design, its currency has zero
monetary value; is minted and airdropped to its users every week; is worthless
until given to another user; is destroyed rather than transferred when spent;
and implicitly decays in value as its network scales.

5. For details on how it works, see the [project README](./README.md).

6. YKarma is also an example of software as performance art. It is a truth
universally acknowledged that a blockchain should only be used to store hashes,
account allocations, and other high-value, densely packed information, and
should not be used as primary datastore. YKarma makes a point of using its
blockchain as its _only_ datastore, aside from the use of Google Firebase for
web authentication.

7. This was, to understate, not done for the sake of either development or
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

10. As such, YKarma is intended both as an implementation of a single potentially
useful flavor of an experimental economy, and an open-source seed example to be
forked / built upon by others. Let a thousand weird cryptoflowers bloom!

11. For details on how to clone/run it locally, see the [project HOWTO](./HOWTO.md).

12. Running it on the public Ethereum mainnet blockchain would be both punitively
expensive and impossible, due to the sheer number of transactions, if it were
to scale to become even a modest success. As such it currently runs on a
private Proof-of-Authority Ethereum blockchain.

13. The vague eventual intent, however, is for each YKarma community to run its own
private chain as an
[Ethermint zone](https://blog.cosmos.network/a-beginners-guide-to-ethermint-38ee15f8a6f4)
(or equivalent on some other pan-chain system), and for each community to
decide the others, if any, with which they want to federate their reputations.
And also, while we're at it, to preserve the privacy of account balances from
chain explorers, using SNARKs or what have you, to ensure that this reputation
currency is not used as a reputation rating.

14. That is of course all very handwavey, but it seems likely that in a year or
two it will be technically feasible.

* This I believe: every Git repo should include a MANIFESTO.md.

* I had hoped to reach a full sacrilegious 95 theses, but it turns out 95 is a
very large number in this context.
