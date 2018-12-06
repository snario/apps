import BN from "bn.js";
// import { Move } from './moves'; 
// import { Result } from './results';
import * as positions from './positions';
// import { randomHex } from "../utils/randomHex";
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
const oneFour = [new BN(1), new BN(4)].map(bnToHex) as [string, string];
const zeroSeven = [new BN(0), new BN(7)].map(bnToHex) as [string, string];
const sevenOne = [new BN(7), new BN(1)].map(bnToHex) as [string, string];
const sevenZero = [new BN(7), new BN(0)].map(bnToHex) as [string, string];

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
  playing1: positions.Xplaying({...base, turnNum:  4, noughts:0b000000000, crosses:0b100000000, balances:sixFour}),
  playing2: positions.Oplaying({...base, turnNum:  5, noughts:0b000010000, crosses:0b100000000, balances:fourSix}),
  playing3: positions.Xplaying({...base, turnNum:  6, noughts:0b000010000, crosses:0b100000001, balances:sixFour}),
  playing4: positions.Oplaying({...base, turnNum:  7, noughts:0b000011000, crosses:0b100000001, balances:fourSix}),
  playing5: positions.Xplaying({...base, turnNum:  8, noughts:0b000011000, crosses:0b100100001, balances:sixFour}),
  playing6: positions.Oplaying({...base, turnNum:  9, noughts:0b000011100, crosses:0b100100001, balances:fourSix}),
  playing7: positions.Xplaying({...base, turnNum: 10, noughts:0b000011100, crosses:0b101100001, balances:sixFour}),
  playing8: positions.Oplaying({...base, turnNum: 11, noughts:0b010011100, crosses:0b101100001, balances:fourSix}),
  draw:     positions.draw({...base, turnNum: 12, noughts:0b010011100, crosses:0b101100011, balances:fiveFive}),
  resting:  positions.resting({ ...base, turnNum: 13, balances: fiveFive}),

  preFundSetupAHex:  '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  preFundSetupBHex:  '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  postFundSetupAHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  postFundSetupBHex: '0x000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
  
  playing1Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000004' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000006' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000004' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'0000000000000000000000000000000000000000000000000000000000000000' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000100', // [GameAttributes: crosses]

  playing2Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000005' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000006' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000002' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'0000000000000000000000000000000000000000000000000000000000000010' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000100', // [GameAttributes: crosses]

  playing3Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000006' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000006' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000004' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'0000000000000000000000000000000000000000000000000000000000000010' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000101', // [GameAttributes: crosses]

  playing4Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000007' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000006' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000002' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'0000000000000000000000000000000000000000000000000000000000000018' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000101', // [GameAttributes: crosses]

  playing5Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000008' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000006' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000004' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'0000000000000000000000000000000000000000000000000000000000000018' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000121', // [GameAttributes: crosses]

  playing6Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'0000000000000000000000000000000000000000000000000000000000000009' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000006' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000002' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'000000000000000000000000000000000000000000000000000000000000001c' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000121', // [GameAttributes: crosses]

  playing7Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'000000000000000000000000000000000000000000000000000000000000000a' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000006' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000004' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'000000000000000000000000000000000000000000000000000000000000001c' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000161', // [GameAttributes: crosses]

  playing8Hex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'000000000000000000000000000000000000000000000000000000000000000b' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000006' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000002' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'000000000000000000000000000000000000000000000000000000000000009c' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000161', // [GameAttributes: crosses]

  drawHex:       '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'000000000000000000000000000000000000000000000000000000000000000c' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000005' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000005' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000004' // [GameAttributes: GamePositionType]
                     +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                     +'000000000000000000000000000000000000000000000000000000000000009c' // [GameAttributes: noughts
                     +'0000000000000000000000000000000000000000000000000000000000000163', // [GameAttributes: crosses]

  restingHex:    '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                     +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                     +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                     +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                     +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                     +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                     +'000000000000000000000000000000000000000000000000000000000000000d' // turnNum
                     +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                     +'0000000000000000000000000000000000000000000000000000000000000005' // aResolution
                     +'0000000000000000000000000000000000000000000000000000000000000005' // bResolution
                     +'0000000000000000000000000000000000000000000000000000000000000000' // [GameAttributes: GamePositionType = {resting propose accept playing victory draw}
                     +'0000000000000000000000000000000000000000000000000000000000000001', // [GameAttributes: roundBuyIn]
};

export const aResignsAfterOneRound = {
  ...standard,
  conclude: positions.conclude({...base, turnNum:  8, balances:fourSix}),
  concludeHex:       '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
  +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
  +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
  +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
  +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
  +'0000000000000000000000000000000000000000000000000000000000000003' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
  +'0000000000000000000000000000000000000000000000000000000000000008' // turnNum
  +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
  +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
  +'0000000000000000000000000000000000000000000000000000000000000006', // bResolution
};

export const noughtsVictory = {
  ...standard,
  playing1: positions.Xplaying({...base, turnNum:  7, noughts:0b000000000, crosses:0b000010000, balances:sixFour}),
  playing2: positions.Oplaying({...base, turnNum:  8, noughts:0b100000000, crosses:0b000010000, balances:fourSix}),
  playing3: positions.Xplaying({...base, turnNum:  9, noughts:0b100000000, crosses:0b000010100, balances:sixFour}),
  playing4: positions.Oplaying({...base, turnNum: 10, noughts:0b110000000, crosses:0b000010100, balances:fourSix}),
  playing5: positions.Xplaying({...base, turnNum: 11, noughts:0b110000000, crosses:0b000010101, balances:sixFour}),
  playing5closetoempty: positions.Xplaying({...base, turnNum: 11, noughts:0b110000000, crosses:0b000010101, balances:oneFour}),
  victory:  positions.victory({...base, turnNum: 12, noughts:0b111000000, crosses:0b000010101, balances:fourSix}),
  absolutevictory: positions.victory({...base, turnNum: 12, noughts:0b111000000, crosses:0b000010101, balances:zeroSeven}),
  victoryHex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                    +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                    +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                    +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                    +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                    +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                    +'000000000000000000000000000000000000000000000000000000000000000c' // turnNum
                    +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                    +'0000000000000000000000000000000000000000000000000000000000000004' // aResolution
                    +'0000000000000000000000000000000000000000000000000000000000000006' // bResolution
                    +'0000000000000000000000000000000000000000000000000000000000000003' // [GameAttributes: GamePositionType = {resting Oplaying Xplaying victory draw}
                    +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                    +'00000000000000000000000000000000000000000000000000000000000001c0' // [GameAttributes: noughts
                    +'0000000000000000000000000000000000000000000000000000000000000015', // [GameAttributes: crosses]
};

export const crossesVictory = {
  ...standard,
  playing1: positions.Xplaying({...base, turnNum:  7, noughts:0b000000000, crosses:0b000000001, balances:sixFour}),
  playing2: positions.Oplaying({...base, turnNum:  8, noughts:0b100000000, crosses:0b000001001, balances:fourSix}),
  playing3: positions.Xplaying({...base, turnNum:  9, noughts:0b100000000, crosses:0b000001001, balances:sixFour}),
  playing4: positions.Oplaying({...base, turnNum: 10, noughts:0b100010000, crosses:0b000001001, balances:fourSix}),
  playing4closetoempty: positions.Oplaying({...base, turnNum: 10, noughts:0b100010000, crosses:0b000001001, balances:sevenOne}),
  victory: positions.victory({...base, turnNum: 11, noughts:0b100010000, crosses:0b001001001, balances:sixFour}),
  absolutevictory: positions.victory({...base, turnNum: 11, noughts:0b100010000, crosses:0b001001001, balances:sevenZero}),
  victoryHex:   '0x'+'0000000000000000000000001111111111111111111111111111111111111111' // libraryAdress
                    +'0000000000000000000000000000000000000000000000000000000000000004' // channelNonce
                    +'0000000000000000000000000000000000000000000000000000000000000002' // number of participants
                    +'000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // asAddress
                    +'000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // bsAddress
                    +'0000000000000000000000000000000000000000000000000000000000000002' // StateType (PreFundSetup, PostFundSetup, Game, Conclude)
                    +'000000000000000000000000000000000000000000000000000000000000000c' // turnNum
                    +'0000000000000000000000000000000000000000000000000000000000000000' // stateCount ?
                    +'0000000000000000000000000000000000000000000000000000000000000006' // aResolution
                    +'0000000000000000000000000000000000000000000000000000000000000004' // bResolution
                    +'0000000000000000000000000000000000000000000000000000000000000003' // [GameAttributes: GamePositionType = {resting Oplaying Xplaying victory draw}
                    +'0000000000000000000000000000000000000000000000000000000000000001' // [GameAttributes: roundBuyIn]
                    +'0000000000000000000000000000000000000000000000000000000000000140' // [GameAttributes: noughts
                    +'0000000000000000000000000000000000000000000000000000000000000049', // [GameAttributes: crosses]
};

export const aRejectsGame = {
  rest: positions.resting({...base, turnNum: 0, balances: fiveFive}),
  propose: positions.Xplaying({...base, turnNum: 1, noughts: 0, crosses: 0b1000000000, balances: fourSix}),
  reject: positions.resting({...base, turnNum: 2, balances: fiveFive}),
  cheatreject: positions.resting({...base, turnNum: 2, balances: sixFour}), // note incorrect balances

}


// export const bResignsAfterOneRound = {
//   ...standard,
//   conclude: positions.conclude({ ...base, turnNum: 7, balances: sixFour }),
//   conclude2: positions.conclude({ ...base, turnNum: 8, balances: sixFour }),
// };

// export const insufficientFunds = {
//   preFundSetupA: positions.preFundSetupB({ ...base, turnNum: 0, balances: nineOne, stateCount: 0 }),
//   preFundSetupB: positions.preFundSetupB({ ...base, turnNum: 1, balances: nineOne, stateCount: 1 }),
//   postFundSetupA: positions.postFundSetupA({ ...base, turnNum: 2, balances: nineOne, stateCount: 0 }),
//   postFundSetupB: positions.postFundSetupB({ ...base, turnNum: 3, balances: nineOne, stateCount: 1 }),
//   asMove,
//   bsMove,
//   propose: positions.proposeFromSalt({ ...base, turnNum: 4, balances: nineOne, asMove, salt }),
//   accept: positions.accept({ ...base, turnNum: 5, balances: eightTwo, preCommit, bsMove }),
//   reveal: positions.reveal({ ...base, turnNum: 6, balances: tenZero, bsMove, asMove, salt }),
//   conclude: positions.conclude({ ...base, turnNum: 7, balances: tenZero }),
//   conclude2: positions.conclude({ ...base, turnNum: 8, balances: tenZero }),
// };

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
    // aResult: Result.YouWin,
    // bResult: Result.YouLose,
    playing1: positions.Xplaying({...base, turnNum:  4, noughts:0b000000000, crosses:0b100000000, balances:sixFour}),
    playing2: positions.Oplaying({...base, turnNum:  5, noughts:0b000010000, crosses:0b100000000, balances:fourSix}),
  };
}
