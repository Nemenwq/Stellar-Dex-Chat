# FiatBridge Contract — Integrator Reference

## Receipt IDs

### Current Type: `BytesN<32>`

Receipt IDs are deterministic **32-byte SHA-256 hashes**, not sequential `u64` integers.

#### Derivation

The contract derives each receipt ID by hashing a struct that combines the
depositor address, token address, amount, memo hash, and a monotonically
increasing per-contract `ReceiptCounter`:

```rust
// DataKey::ReceiptCounter tracks the next counter value (u64)
// DataKey::ReceiptIndex(counter) maps counter → BytesN<32> receipt hash
// DataKey::Receipt(BytesN<32>) stores the full Receipt struct
```

#### Reading a receipt ID from the `rcpt_issd` event (TypeScript)

```ts
import { Contract, SorobanRpc, xdr } from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

// Fetch the transaction's result metadata and scan contract events
const txMeta = await server.getTransaction(txHash);

for (const event of txMeta.resultMetaXdr.v3().sorobanMeta()?.events() ?? []) {
  const topics = event.body().v0().topics();
  const eventName = topics[0].sym().toString(); // "rcpt_issd"

  if (eventName === "rcpt_issd") {
    // event data is a BytesN<32> — hex-encode it for storage / display
    const receiptIdBytes: Buffer = Buffer.from(
      event.body().v0().data().bytes()
    );
    const receiptIdHex = receiptIdBytes.toString("hex");
    console.log("Receipt ID:", receiptIdHex);
    // e.g. "a3f1c8...64d2" (64 hex chars = 32 bytes)
  }
}
```

### `ReceiptIndex` enumeration

The contract maintains a `ReceiptIndex(u64)` mapping so receipts can be
iterated by sequential position without knowing the hash in advance:

```ts
// Query receipt by index position (0-based)
const receiptHash: string = await contract.get_receipt_by_index({ index: 0n });

// Total number of receipts issued
const count: bigint = await contract.get_receipt_counter();
```

---

## Migration Notes for Integrators

### Upgrading from `u64` receipt IDs

Previous versions of this contract used a plain `u64` counter as the receipt
ID. If you stored receipt IDs from an older deployment, re-index them as
follows:

| Old field | New field | Notes |
|-----------|-----------|-------|
| `receipt_id: u64` | `receipt_id: BytesN<32>` | 32-byte SHA-256 hash |
| Direct equality check (`id == 5`) | Hash comparison or index lookup | Use `ReceiptIndex(5)` to map counter → hash |

#### Storage key changes

```
Before:  DataKey::Receipt(u64)
After:   DataKey::Receipt(BytesN<32>)
         DataKey::ReceiptIndex(u64)   ← new: counter → hash mapping
         DataKey::ReceiptCounter      ← new: next counter value
```

#### Event payload changes

```
Before:  rcpt_issd data = u64
After:   rcpt_issd data = BytesN<32>
```

Update any event indexers that cast the `rcpt_issd` data field to `u64` to
instead treat it as a 32-byte buffer and hex-encode it for storage.
