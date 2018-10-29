import BN from "bn.js";
import { Move } from './moves';
import { Result } from './results';
import * as positions from './positions';
import { randomHex } from "../utils/randomHex";
import bnToHex from "../utils/bnToHex";

const libraryAddress = '0x' + '1'.repeat(40);
const channelNonce = 4;
const asAddress = '0x' + 'a'.repeat(40);
const bsAddress = '0x' + 'b'.repeat(40);
const participants: [string, string] = [asAddress, bsAddress];
const roundBuyIn = bnToHex(new BN(1));
const fiveFive = [new BN(5), new BN(5)].map(bnToHex) as [string, string];
const sixFour = [new BN(6), new BN(4)].map(bnToHex) as [string, string];
const fourSix = [new BN(4), new BN(6)].map(bnToHex) as [string, string];
const nineOne = [new BN(9), new BN(1)].map(bnToHex) as [string, string];
const eightTwo = [new BN(8), new BN(2)].map(bnToHex) as [string, string];
const tenZero = [new BN(10), new BN(0)].map(bnToHex) as [string, string];
const asMove = Move.Rock;
const salt = randomHex(64);
const preCommit = positions.hashCommitment(asMove, salt);
const bsMove = Move.Scissors;

const base = {
  libraryAddress,
  channelNonce,
  participants,
  roundBuyIn,
};

const shared = {
  ...base,
  asAddress,
  twitterHandle: "twtr",
  bsAddress,
  myName: 'Tom',
  opponentName: 'Alex',
};

export const standard = {
  ...shared,
  preFundSetupA: positions.preFundSetupA({ ...base, turnNum: 0, balances: fiveFive, stateCount: 0 }),
  preFundSetupB: positions.preFundSetupB({ ...base, turnNum: 1, balances: fiveFive, stateCount: 1 }),
  postFundSetupA: positions.postFundSetupA({ ...base, turnNum: 2, balances: fiveFive, stateCount: 0 }),
  postFundSetupB: positions.postFundSetupB({ ...base, turnNum: 3, balances: fiveFive, stateCount: 1 }),
  asMove,
  salt,
  preCommit,
  bsMove,
  aResult: Result.YouWin,
  bResult: Result.YouLose,
  propose: positions.proposeFromSalt({ ...base, turnNum: 4, balances: fiveFive, asMove, salt }),
  accept: positions.accept({ ...base, turnNum: 5, balances: fourSix, preCommit, bsMove }),
  reveal: positions.reveal({ ...base, turnNum: 6, balances: sixFour, bsMove, asMove, salt }),

  preFundSetupAHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  preFundSetupBHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  postFundSetupAHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  postFundSetupBHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  proposeHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f5cafdccc1599ae1d89b67782e35207b00705758e1d33365035bda45562f9663',
  acceptHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f5cafdccc1599ae1d89b67782e35207b00705758e1d33365035bda45562f96630000000000000000000000000000000000000000000000000000000000000002',
  revealHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004444444444444444444444444444444444444444444444444444444444444444',
};

export const aResignsAfterOneRound = {
  ...standard,
  resting: positions.resting({ ...base, turnNum: 7, balances: sixFour }),
  conclude: positions.conclude({ ...base, turnNum: 8, balances: sixFour }),
  conclude2: positions.conclude({ ...base, turnNum: 9, balances: sixFour }),
  restingHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  concludeHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000004',
};

export const bResignsAfterOneRound = {
  ...standard,
  conclude: positions.conclude({ ...base, turnNum: 7, balances: sixFour }),
  conclude2: positions.conclude({ ...base, turnNum: 8, balances: sixFour }),
};

export const insufficientFunds = {
  preFundSetupA: positions.preFundSetupB({ ...base, turnNum: 0, balances: nineOne, stateCount: 0 }),
  preFundSetupB: positions.preFundSetupB({ ...base, turnNum: 1, balances: nineOne, stateCount: 1 }),
  postFundSetupA: positions.postFundSetupA({ ...base, turnNum: 2, balances: nineOne, stateCount: 0 }),
  postFundSetupB: positions.postFundSetupB({ ...base, turnNum: 3, balances: nineOne, stateCount: 1 }),
  asMove,
  bsMove,
  propose: positions.proposeFromSalt({ ...base, turnNum: 4, balances: nineOne, asMove, salt }),
  accept: positions.accept({ ...base, turnNum: 5, balances: eightTwo, preCommit, bsMove }),
  reveal: positions.reveal({ ...base, turnNum: 6, balances: tenZero, bsMove, asMove, salt }),
  conclude: positions.conclude({ ...base, turnNum: 7, balances: tenZero }),
  conclude2: positions.conclude({ ...base, turnNum: 8, balances: tenZero }),
};

export function build(customLibraryAddress: string, customAsAddress: string, customBsAddress: string) {
  const customParticipants: [string, string] = [customAsAddress, customBsAddress];
  const customBase = {
    libraryAddress: customLibraryAddress,
    channelNonce,
    participants: customParticipants,
    roundBuyIn,
  };

  const customShared = {
    ...customBase,
    asAddress: customAsAddress,
    bsAddress: customBsAddress,
    myName: 'Tom',
    opponentName: 'Alex',
  };

  return {
    ...customShared,
    preFundSetupA: positions.preFundSetupA({ ...base, turnNum: 0, balances: fiveFive, stateCount: 0 }),
    preFundSetupB: positions.preFundSetupB({ ...base, turnNum: 1, balances: fiveFive, stateCount: 1 }),
    postFundSetupA: positions.postFundSetupA({ ...base, turnNum: 2, balances: fiveFive, stateCount: 0 }),
    postFundSetupB: positions.postFundSetupB({ ...base, turnNum: 3, balances: fiveFive, stateCount: 1 }),
    asMove,
    salt,
    preCommit,
    bsMove,
    aResult: Result.YouWin,
    bResult: Result.YouLose,
    propose: positions.proposeFromSalt({ ...base, turnNum: 4, balances: fiveFive, asMove, salt }),
    accept: positions.accept({ ...base, turnNum: 5, balances: fourSix, preCommit, bsMove }),
    reveal: positions.reveal({ ...base, turnNum: 6, balances: sixFour, bsMove, asMove, salt }),
    resting: positions.resting({ ...base, turnNum: 7, balances: sixFour }),
  };
}
