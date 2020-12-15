---
sip: 60
title: New Escrow Contract & Migration
status: Proposed
author: Clinton Ennis (@hav-noms), Jackson Chan (@jacko125)
discussions-to: <https://discord.gg/ShGSzny>

created: 2020-05-20
---

<!--You can leave these HTML comments in your merged SIP and delete the visible duplicate text guides, they will not appear and may be helpful to refer to if you edit it again. This is the suggested template for new SIPs. Note that an SIP number will be assigned by an editor. When opening a pull request to submit your SIP, please use an abbreviated title in the filename, `sip-draft_title_abbrev.md`. The title should be 44 characters or less.-->

## Simple Summary

<!--"If you can't explain it simply, you don't understand it well enough." Provide a simplified and layman-accessible explanation of the SIP.-->

Migrate to a new SNX escrow contract that supports liquidations of escrowed SNX, L2 migration, flexible and infinite escrow support for terminal inflation, migrate and deprecate the existing reward escrow contract.

## Abstract

<!--A short (~200 word) description of the technical issue being addressed.-->

The current SNX [RewardEscrow](https://contracts.synthetix.io/RewardEscrow) contract is limited only allowing the [FeePool](https://contracts.synthetix.io/FeePool) to escrow SNX rewards from the inflationary supply.

It was not designed to be used as a general purpose escrow contract. New requirements include adding arbitary length escrow entries to be created by anyone as well as supporting the new terminal inflation and liquidation.

This will require a migration of all escrowed SNX and escrow entries from the current [RewardEscrow](https://contracts.synthetix.io/RewardEscrow) to new Reward Escrow V2 contract.

## Motivation

<!--The motivation is critical for SIPs that want to change Synthetix. It should clearly explain why the existing protocol specification is inadequate to address the problem that the SIP solves. SIP submissions without sufficient motivation may be rejected outright.-->

### Current limitations of the `RewardEscrow` contract

1. Only escrows SNX for 12 months.
2. Only `FeePool` has the authority to create escrow entries.
3. The escrow table `checkAccountSchedule` only supports returning up to 5 years of escrow entries from the initial inflationary supply.
4. `Vest` can only be called by the owner of the SNX.
5. Cannot support liquidations of escrowed SNX for [sip-15](https://sips.synthetix.io/sips/sip-15).

### Desired features for a general `SynthetixEscrow` contract

1. Ability to add arbitrary escrow periods. e.g. 3 months to 2 years.
2. Public escrowing. Allows any EOA or any contract to escrow SNX. Allowing SNX to be escrowed for protocol contributors, investors and funds or contracts that escrow some sort of incentive similar to the Staking Rewards.
3. Update `checkAccountSchedule` to allow for terminal inflation and an unlimited escrow navigation through paging.
4. Allowing anyone to `vest` an accounts escrowed tokens allows Synthetix network keepers to help support SNX holders and supports the [Liquidation system](https://sips.synthetix.io/sips/sip-15) to vest an under collateralised accounts vest-able SNX to be paid to the liquidator.
5. If an account being [liquidated](https://sips.synthetix.io/sips/sip-15) does not have enough transferable SNX in their account and the system needs to liquidate escrowed SNX being used as collateral then reassign the escrow amounts to the liquidators account in the escrow contract.
6. Ability for account merging of escrowed tokens at specific time windows for people to merge their balances - [sip-13](https://sips.synthetix.io/sips/sip-13).
7. Ability to migrate escrowed SNX and vesting entries to L2 OVM. An internal contract (base:SynthetixBridgeToOptimism) to clear all entries for a user (during the initial deposit phase of L2 migration).
8. Continuous streaming of the escrowed SNX for each vesting entry. The escrowed SNX will be claimable based on the block timestamp, the amount emitted per second is determined by the duratoin of the escrow period and amount escrowed. i.e, Given 1000 SNX escrowed for 12 months, 500 SNX will be claimable after 6 months. Continuous vesting of escrowed SNX allows each vesting entry to be managed as an independent balance, allows vesting of one or multiple entries, account merging escrow entries, migration of escrowed SNX to L2 reward escrow contract.

## Continuous Reward Escrow Emission / Claiming

- Each escrow vesting entry is a continuous stream of SNX
- The emission rate of the stream is based on the “amount of SNX escrowed / duration”.
- Supports different escrow durations (6, 12, 24 months) and account merging by re-assigning vesting entries to new owner. Rate of SNX that is claimable for each vesting entry is calculated in SNX per seconds.
- Claiming allows the user / interface to specify which vesting entries to claim (ID of the vesting entry) for the accumulated SNX.
- Removes the bottleneck of having on-chain calculation of what vesting entries can be vested / requirement for a sorted array of VestingEntries

**New functions to support continuous reward claiming**

- `vest(address account, uint256[] calldata entryIDs)`

- `timeSinceLastVested(address account, uint256 entryID)`

- `ratePerSecond(address account, uint256 entryID)`

- `getVestingQuantity(address account, uint256[] calldata entryIDs)`

- `getVestingEntryClaimable(address account, uint256 entryID)`

## Specification

<!--The technical specification should describe the syntax and semantics of any new feature.-->

```
library VestingEntries {
    struct VestingEntry {
        uint64 endTime;
        uint64 duration;
        uint64 lastVested;
        uint256 escrowAmount;
        uint256 remainingAmount;
    }
}


interface IRewardEscrowV2 {
    // Views
    function balanceOf(address account) external view returns (uint);

    function numVestingEntries(address account) external view returns (uint);

    function totalEscrowedAccountBalance(address account) external view returns (uint);

    function totalVestedAccountBalance(address account) external view returns (uint);

    function getVestingQuantity(address account, uint256[] calldata entryIDs) external view returns (uint);

    function getVestingEntryClaimable(address account, uint256 entryID) external view returns (uint);

    function timeSinceLastVested(address account, uint256 entryID) external view returns (uint);

    function ratePerSecond(address account, uint256 entryID) external view returns (uint);

    // Mutative functions
    function vest(address account, uint256[] calldata entryIDs) external;

    function createEscrowEntry(
        address beneficiary,
        uint256 deposit,
        uint256 duration
    ) external;

    function appendVestingEntry(
        address account,
        uint256 quantity,
        uint256 duration
    ) external;

    function migrateVestingSchedule(address _addressToMigrate) external;

    function migrateAccountEscrowBalances(
        address[] calldata accounts,
        uint256[] calldata escrowBalances,
        uint256[] calldata vestedBalances
    ) external;

    // Account Merging
    function startMergingWindow() external;

    function mergeAccount(address accountToMerge, uint256[] calldata entryIDs) external;

    function nominateAccountToMerge(address account) external;

    // L2 Migration
    function importVestingEntries(
        address account,
        uint256 escrowedAmount,
        VestingEntries.VestingEntry[] calldata vestingEntries
    ) external;

    // Return amount of SNX transfered to SynthetixBridgeToOptimism deposit contract
    function burnForMigration(address account, uint[] calldata entryIDs)
        external
        returns (uint256 escrowedAccountBalance, VestingEntries.VestingEntry[] memory vestingEntries);
}
```

### Migration

1. Synthetix contract will need to be upgraded to migrate the SNX from the old escrow contract to the new contract onchain. There will be a temporary function to allow the pdao to execute this on Synthetix.

2. During the migration `Vest` needs to be disabled or effectivly fail to ensure integrity of escrow entries and SNX balances being migrated for all accounts.

3. `totalEscrowedAccountBalance` and `totalVestedAccountBalance` will be migrated by the protocol for all accounts on the OLD reward escrow to ensure users are allocated their collateral for staking on the new reward escrow contract.

4. Claiming rewards and vesting on the new contract will be blocked for users with existing vesting entries who haven't migrated their previous vesting entries.

5. Users with existing vesting entries on the old rewards escrow will need to migrate their vesting entries across to the new contract. The migration will read from the address's existing entries and copy them from the old escrow contract.

6. Any escrow SNX that can be vested will be vested first. This will mean that only the remaining 52 weeks of vesting entries will be copied to the new Reward Escrow.

### L2 Escrow Migration

With the launch of L2 Staking for SNX on the OVM testnet, users will be able to migrate all their SNX and escrowed SNX to L2 for staking and rewards. The vesting entries will be copied onto the L2 reward escrow contract that mirrors the migration process.

1. The `SynthetixBridgeToOptimism.depositAndMigrateEscrow()` transaction will vest any escrowed SNX that can be vested and transfer the remaining `totalEscrowedAccountBalance` SNX amount from the Reward escrow contract into the deposit contract. The vesting entries on L1 reward escrow will be deleted for the address.

2. The L1 migration step is required for stakers to migrate to L2 their escrowed SNX (if they have escrowed SNX on the old escrow contract).

If the user has not migrated on L1 to the new escrow contract, the `SynthetixBridgeToOptimism.depositAndMigrateEscrow()` function will fail.

To prevent an address from migrating their SNX staking to L2 and then duplicating their vesting entries to the new Reward Escrow afterwards, `migrateVestingSchedule()` will fail if the address has already migrated to L2 first.

Fields migrated to L2 Reward Escrow:

```
    escrowedAccountBalance

    And

    struct VestingEntry {
        uint64 endTime;
        uint64 duration;
        uint64 lastVested;
        uint256 escrowAmount;
        uint256 remainingAmount;
    }
```

3. L2 migration is an irreversible action. Escrowed SNX on L2 will need to be vested on L2 first before withdrawing to L1.

### Account Merging

- Require all debt to be burned before account merging is open for a staker.
- Approve and record the recipient / destination address that will claim the new escrow SNX amount and vesting entries.
- The recipient address will sign a transaction to merge the escrowed SNX amount and add to their existing `totalEscrowedAccountBalance` balance and append the vesting entries to their `vestingSchedules`.

## Test Cases

<!--Test cases for an implementation are mandatory for SIPs but can be included with the implementation..-->

TBD

## Implementation

<!--The implementations must be completed before any SIP is given status "Implemented", but it need not be completed before the SIP is "Approved". While there is merit to the approach of reaching consensus on the specification and rationale before writing code, the principle of "rough consensus and running code" is still useful when it comes to resolving many discussions of API details.-->

## Configurable Values (Via SCCP)

<!--Please list all values configurable via SCCP under this implementation.-->

TBD

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
