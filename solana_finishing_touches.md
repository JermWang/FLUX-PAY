Solana “Works Like BNB” Rundown Sheet (Routing Loop + Key Differences)
This is the exact working pattern your BNB app uses (plan → funding → hop loop → status), translated into a Solana implementation checklist with the major differences called out. The goal is: the transfer reliably advances through every hop and never gets “stuck” after the first transaction.

1) The “Working BNB Loop” (Reference Architecture)
Server endpoints (BNB)
POST /api/transfer
Builds a routing plan and persists it.
Returns:
id
hopCount
firstBurnerAddress
fee + gas estimates
POST /api/transfer/step
Advances the transfer by one step:
Funding detection (awaiting_funding)
Fee collection (if applicable)
Execute next hop
Cleanup sweeps at the end
Uses state.inFlight and stale reconciliation to prevent deadlocks/duplication.
GET /api/transfer/status?id=...
Read-only: returns plan + state including:
currentHop
hopResults[]
lastError
finalTxHash
Client loop (BNB)
UI calls /api/transfer to get planId + firstBurnerAddress.
User funds the first burner from their wallet.
UI polls:
/api/transfer/step (drives progress)
/api/transfer/status (renders progress)
Progress is driven by:
state.currentHop
state.hopResults
state.nextActionAtUnixMs (timing jitter)
The key BNB “it never gets stuck” techniques
state.inFlight (one action at a time)
Stale in-flight reconciliation (if response is lost, you can recover)
Native coin hops use a sweep:
send balance - gas, not a fixed amount
Token hops require gas:
if hop wallet lacks gas, step returns a “gas required” action
2) Build Solana to Match This (Step-by-Step Blueprint)
2.1 Plan creation (Solana equivalent of POST /api/transfer)
Persist exactly the same concept: plan + state.

Plan should include

id
fromWallet, toWallet (base58)
asset:
"SOL" or { mint: string } (SPL)
amountLamports (or token raw amount)
hopCount (same idea, e.g. 7–12)
burners[]:
burner pubkeys + signing source (Keypair/Privy/etc.)
hopDelaysMs[]
fee policy (holder vs non-holder if you have this on Solana)
Return to UI

planId
firstBurnerAddress
hopCount
estimatedCompletionMs
Important Solana difference

You do not store blockhash in the plan. Always fetch a fresh blockhash per hop tx.
2.2 Funding detection (Solana equivalent of “awaiting_funding”)
In POST /api/transfer/step when status is awaiting_funding:

If the UI passes fundingSignature, try confirm:
getSignatureStatuses([sig]) and/or confirmTransaction(...)
Also check:
getBalance(firstBurner) >= requiredLamports
for SPL: token account balance >= requiredRaw (and ATA existence)
Difference vs BNB

Confirmation is signature-based, but balance checks are often more reliable in practice across inconsistent RPCs. Use both like BNB uses receipt + balance.
2.3 The hop loop (Solana equivalent of “routing”)
This is where Solana commonly “gets stuck” if done incorrectly.

For hop i:

from = burner[i]
to = burner[i+1] or final destination
If Date.now() < nextActionAtUnixMs: return waiting
Set:
state.inFlight = { action: "hop:i", startedAtUnixMs, signature?: string }
Build tx with fresh blockhash
Send tx, store signature in state, confirm, then:
push { index: i, signature, success: true } to hopResults
increment currentHop
set nextActionAtUnixMs = now + hopDelaysMs[nextHop]
3) The “Stuck on Solana Hops” Root Cause (Most Likely)
BNB fixed this by sweeping native coin minus gas each hop.

You must do the same on Solana for SOL hops
If you forward a fixed lamport amount each hop, you will eventually fail because each hop burns:

tx fee (lamports per signature)
possibly extra compute fee
(for SPL) ATA creation rent + fees
Solana-native hop rule (mirror BNB sweep):

balance = getBalance(from)
fee = estimateFeeLamports(message) (preferred: getFeeForMessage)
amountToSend = balance - fee - safetyReserve
If amountToSend <= 0:
fail with clear error, or
trigger a “need lamports for fees” top-up step (Solana version of BNB’s gas:hop)
This single change is often the difference between:

“first hop works, then it stalls” and
“every hop progresses reliably”
4) Solana Differences You Must Explicitly Handle (BNB Parity Checklist)
Fees
BNB: gas price * gas limit
Solana: tx fee in lamports (signatures + compute)
Parity requirement: sweep minus fee per hop for SOL
Blockhash expiry
If you reuse a blockhash or confirm incorrectly, you’ll see:
“Blockhash not found”
“Transaction not confirmed”
Parity requirement:
fresh blockhash per tx
retry send + confirm with timeout
SPL token transfers
Each burner must still have SOL for fees.
If receiver ATA doesn’t exist, you must create it (rent).
Parity requirement:
Solana’s version of “gas top-up” for SPL hops
Idempotency + recovery (super important)
BNB uses:

state.inFlight + stale reconciliation, and sometimes chain searching.
Solana should also:

Persist hop signature immediately
On stale inFlight:
if signature exists → check getSignatureStatuses
if missing → you’re blind unless you add a marker
Highly recommended Solana trick

Add a Memo instruction per hop like:
uwu:<planId>:hop:<i>
Then stale reconciliation can scan getSignaturesForAddress(from) and parse recent txs to recover.
5) What to Copy 1:1 From BNB Design (Conceptually)
DB record structure: { plan, state } with optimistic concurrency
State machine: awaiting_funding → routing → complete/failed
Step endpoint that advances one action per poll
inFlight + stale reconciliation
hopResults array used by UI to render progress
nextActionAtUnixMs for jitter/timing
If you want this to be “perfect” (targeted to your Solana repo)
Send me the Solana repo equivalents of:

plan creation endpoint
step/worker endpoint
status endpoint
transfer store schema
…and I’ll produce a direct migration checklist (“change X to match the BNB sweep + inFlight recovery”) specifically where your Solana loop is currently failing.