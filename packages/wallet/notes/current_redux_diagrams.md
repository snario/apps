<!-- Recommend VSCode plugin 
Name: Markdown Preview Mermaid Support
Id: bierner.markdown-mermaid
Description: Adds Mermaid diagram and flowchart support to VS Code's builtin markdown preview
Version: 1.1.2
Publisher: Matt Bierner
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid -->
# Redux diagrams (current state)
as of commit 1947c682f74648ee162459314827bb9e24ca1fb1
### Methodology
These flowcharts are made by constructing nodes from the *state types* or (*stage types* where indicated), from the relevant file in a `/states/` directory, and then constructing edges from the relationships defined in the relevant `/reducers/` directory. Edges are labelled with the *action types* from the `/actions/` directory (or function calls such as other reducers), and the flowcharts suppress information about conditional checks that are performed by the reducers. Where useful, reducers have had their sub-reducers unpacked -- making for a fewer number of more complicated flowcharts. When a reducer returns the same state as the result of conditional checks failing, these loops are also suppressed. Globally handled actions are also sometimes suppressed.
<!-- TODO: consider using the actual `string` value of the types, rather than the variable name. -->
<!-- TODO: related to ^, consider enforcing this string to be *exactly* the same as the type variable name -->
<!-- TODO: use hyperlinks / anchors to make this document easier to navigate. -->


### Key: 
```mermaid
  graph LR
  linkStyle default interpolate basis
    STATE --> |ACTION| ANOTHER_STATE
    ANOTHER_STATE.->|functionCall| YET_ANOTHER_STATE
```
# Top level
[`/packages/wallet/src/redux/reducers/index.ts`](../src/redux/reducers/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    WAIT_FOR_LOGIN -->|LOGGED_IN| WAIT_FOR_ADJUDICATOR

    WAIT_FOR_ADJUDICATOR-->|ADJUDICATOR_KNOWN| WAITING_FOR_CHANNEL_INITIALIZATION

    METAMASK_ERROR
    
    WAITING_FOR_CHANNEL_INITIALIZATION -->|CHANNEL_INITIALIZED| INITIALIZING_CHANNEL

    INITIALIZING_CHANNEL .->|channelReducer| CHANNEL_INITIALIZED

    CHANNEL_INITIALIZED .->|channelReducer| CHANNEL_INITIALIZED

```
TODO: side effects

# channelReducer
[`/packages/wallet/src/redux/reducers/channels/index.ts`](../src/redux/reducers/channels/index.ts)

These are values for `channelStage` rather than `type`:
```mermaid
  graph TD
  linkStyle default interpolate basis
    OPENING .->|openingReducer| OPENING
    OPENING .->|openingReducer| FUNDING

    FUNDING .->|fundingReducer| FUNDING
    FUNDING .->|fundingReducer| RUNNING

    RUNNING .->|runningReducer| RUNNING
    RUNNING .->|runningReducer| CHALLENGING
    RUNNING .->|runningReducer| RESPONDING
    RUNNING .->|runningReducer| WITHDRAWING

    WITHDRAWING .->|withdrawingReducer| WITHDRAWING
    WITHDRAWING .->|withdrawingReducer| CLOSING

    CLOSING .->|closingReducer| CLOSING
```

## openingReducer
[`/packages/wallet/src/redux/reducers/channels/opening.ts`](../src/redux/reducers/channels/opening.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    WAIT_FOR_CHANNEL -->|OWN_COMMITMENT_RECEIEVED| WAIT_FOR_PRE_FUND_SETUP
    WAIT_FOR_CHANNEL -->|OPPONENT_COMMITMENT_RECEIEVED| WAIT_FOR_PRE_FUND_SETUP

    WAIT_FOR_PRE_FUND_SETUP -->|OWN_COMMITMENT_RECEIEVED| WAIT_FOR_FUNDING_REQUEST
    WAIT_FOR_PRE_FUND_SETUP -->|OPPONENT_COMMITMENT_RECEIEVED| WAIT_FOR_FUNDING_REQUEST
```

## fundingReducer
[`/packages/wallet/src/redux/reducers/channels/funding/index.ts`](../src/redux/reducers/channels/funding/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    WAIT_FOR_FUNDING_REQUEST -->|FUNDING_REQUESTED| WAIT_FOR_FUNDING_APPROVAL

    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_REJECTED| SEND_FUNDING_DECLINED_MESSAGE
    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_APPROVED| WAIT_FOR_FUNDING_AND_POST_FUND_SETUP
    WAIT_FOR_FUNDING_APPROVAL -->|MESSAGE_RECEIVED| ACKNOWLEDGE_FUNDING_DECLINED
    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_DECLINED_ACKNOWLEDGED| WAIT_FOR_FUNDING_APPROVAL

    WAIT_FOR_FUNDING_AND_POST_FUND_SETUP

    WAIT_FOR_FUNDING_CONFIRMATION -->|FUNDING_RECEIVED_EVENT| ACKNOWLEDGE_FUNDING_REQUEST

        A_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| ACKNOWLEDGE_FUNDING_SUCCESS
    A_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| WAIT_FOR_FUNDING_CONFIRMATION

    B_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| B_WAIT_FOR_POST_FUND_SETUP
    B_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| ACKNOWLEDGE_FUNDING_SUCCESS

    ACKNOWLEDGE_FUNDING_SUCCESS -->|FUNDING_SUCCESS_ACKNOWLEDGED| ACKNOWLEDGE_FUNDING_SUCCESS

    SEND_FUNDING_DECLINED_MESSAGE -->|MESSAGE_SENT| SEND_FUNDING_DECLINED_MESSAGE
        
    ACKNOWLEDGE_FUNDING_DECLINED -->|FUNDING_DECLINED_ACKNOWLEDGED| ACKNOWLEDGE_FUNDING_DECLINED 
```

## runningReducer
[`/packages/wallet/src/redux/reducers/channels/running.ts`](../src/redux/reducers/channels/running.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    RUNNING .-> |waitForUpdateReducer|...

    WAIT_FOR_UPDATE --> |OWN_COMMITMENT_RECEIVED| WAIT_FOR_UPDATE
    WAIT_FOR_UPDATE --> |OPPONENT_COMMITMENT_RECEIVED| WAIT_FOR_UPDATE
    WAIT_FOR_UPDATE --> |CHALLENGE_CREATED_EVENT| CHOOSE_RESPONSE
    WAIT_FOR_UPDATE --> |CHALLENGE_REQUESTED| APPROVE_CHALLENGE
```

## challengingReducer
[`/packages/wallet/src/redux/reducers/channels/challenging/index.ts`](../src/redux/reducers/channels/challenging/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    APPROVE_CHALLENGE --> |CHALLENGE_APPROVED|WAIT_FOR_CHALLENGE_INITIATION
    APPROVE_CHALLENGE --> |CHALLENGE_REJECTED|WAIT_FOR_UPDATE

    WAIT_FOR_CHALLENGE_INITIATION --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_CHALLENGE_SUBMISSION

    WAIT_FOR_CHALLENGE_SUBMISSION --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_CHALLENGE_SUBMISSION
    WAIT_FOR_CHALLENGE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_CHALLENGE_CONFIRMATION
    WAIT_FOR_CHALLENGE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| CHALLENGE_TRANSACTION_FAILED

    WAIT_FOR_CHALLENGE_CONFIRMATION --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_CHALLENGE_CONFIRMATION 
    WAIT_FOR_CHALLENGE_CONFIRMATION --> |TRANSACTION_CONFIRMED| WAIT_FOR_RESPONSE_OR_TIMEOUT

    WAIT_FOR_RESPONSE_OR_TIMEOUT --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_RESPONSE_OR_TIMEOUT
    WAIT_FOR_RESPONSE_OR_TIMEOUT --> |RESPOND_WITH_MOVE_EVENT| ACKNOWLEDGE_CHALLENGE_RESPONSE
    WAIT_FOR_RESPONSE_OR_TIMEOUT --> |BLOCK_MINED| ACKNOWLEDGE_TIMEOUT

    ACKNOWLEDGE_CHALLENGE_RESPONSE --> |CHALLENGE_RESPONSE_ACKNOWLEDGED| WAIT_FOR_UPDATE
    
    ACKNOWLEDGE_CHALLENGE_TIMEOUT --> |CHALLENGE_TIME_OUT_ACKNOWLEDGED| APPROVE_WITHDRAWAL
    
    CHALLENGE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| WAIT_FOR_CHALLENGE_INITIATION
```

## respondingReducer
[`/packages/wallet/src/redux/reducers/channels/responding/index.ts`](../src/redux/reducers/channels/responding/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    CHOOSE_RESPONSE --> |RESPOND_WITH_MOVE_CHOSEN| TAKE_MOVE_IN_APP
    CHOOSE_RESPONSE --> |RESPOND_WITH_EXISTING_MOVE_CHOSEN| INITIATE_RESPONSE
    CHOOSE_RESPONSE --> |RESPOND_WITH_REFUTE_CHOSEN| INITIATE_RESPONSE
    CHOOSE_RESPONSE --> |BLOCK_MINED| CHOOSE_RESPONSE
    CHOOSE_RESPONSE --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

    TAKE_MOVE_IN_APP --> |CHALLENGE_COMMITMENT_RECEIVED| INITIATE_RESPONSE
    TAKE_MOVE_IN_APP --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

    INITIATE_RESPONSE --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_RESPONSE_SUBMISSION
    INITIATE_RESPONSE --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT
    
    WAIT_FOR_RESPONSE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_RESPONSE_CONFIRMATION
    WAIT_FOR_RESPONSE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| RESPSONSE_TRANSACTION_FAILED
    WAIT_FOR_RESPONSE_SUBMISSION --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

    WAIT_FOR_RESPONSE_CONFIRMATION --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT
    WAIT_FOR_RESPONSE_CONFIRMATION --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_CHALLENGE_COMPLETE

    
    CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT --> |CHALLENGE_TIME_OUT_ACKNOWLEDGED| APPROVE_WITHDRAWAL
   
    ACKNOWLEDGE_CHALLENGE_COMPLETE --> |CHALLENGE_RESPONSE_ACKNOWLEDGED| WAIT_FOR_UPDATE

    RESPONSE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| INITIATE_RESPONSE
```

## withdrawingReducer
[`/packages/wallet/src/redux/reducers/channels/withdrawing/index.ts`](../src/redux/reducers/channels/withdrawing/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    APPROVE_WITHDRAWAL --> |WITHDRAWAL_APPROVED| WAIT_FOR_WITHDRAWAL_INITIATION

    APPROVE_WITHDRAWAL --> |WITHDRAWAL_REJECTED| ACKNOWLEDGE_CLOSE_SUCCESS

    WAIT_FOR_WITHDRAWAL_INITIATION --> |TRANSACTION_SUBMITTED| WAIT_FOR_WITHDRAWAL_CONFIRMATION
    WAIT_FOR_WITHDRAWAL_INITIATION --> |TRANSACTION_SUBMISSION_FAILED| WITHDRAW_TRANSACTION_FAILED

    WAIT_FOR_WITHDRAWAL_CONFIRMATION --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_WITHDRAWAL_SUCCESS 

    ACKNOWLEDGE_WITHDRAWAL_SUCCESS --> |WITHDRAWAL_SUCCESS_ACKNOWLEDGED| WAIT_FOR_CHANNEL

    WITHDRAW_TRANSACTION_FAILED --> |RETRY TRANSACTION| WAIT_FOR_WITHDRAWAL_INITIATION
```

## closingReducer
[`/packages/wallet/src/redux/reducers/channels/closing/index.ts`](../src/redux/reducers/channels/closing/index.ts)
```mermaid
  graph TD
  linkStyle default interpolate basis
    APPROVE_CONCLUDE --> |CONCLUDE_APPROVED| APPROVE_CLOSE_ON_CHAIN
    APPROVE_CONCLUDE --> |CONCLUDE_APPROVED| WAIT_FOR_OPPONENT_CONCLUDE
    APPROVE_CONCLUDE --> |CONCLUDE_REJECTED| WAIT_FOR_UPDATE

    WAIT_FOR_OPPONENT_CONCLUDE --> |COMMITMENT_RECEIVED| APPROVE_CLOSE_ON_CHAIN

    ACKNOWLEDGE_CLOSE_SUCCESS --> |CLOSE_SUCCESS_ACKNOWLEDGED| WAIT_FOR_CHANNEL

    ACKNOWLEDGE_CLOSED_ON_CHAIN --> |CLOSED_ON_CHAIN_ACKNOWLEDGED| WAIT_FOR_CHANNEL

    APPROVE_CLOSE_ON_CHAIN --> |APPROVE_CLOSE| WAIT_FOR_CLOSE_INITIATION

    WAIT_FOR_CLOSE_INITIATION --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_CLOSE_SUBMISSION

    WAIT_FOR_CLOSE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| CLOSE_TRANSACTION_FAILED
    WAIT_FOR_CLOSE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_CLOSE_CONFIRMED

    WAIT_FOR_CLOSE_CONFIRMED --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_CLOSE_SUCCESS

    ACKNOWLEDGE_CONCLUDE --> |CONCLUDE_APPROVED| APPROVE_CLOSE_ON_CHAIN

    CLOSE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| WAIT_FOR_CLOSE_SUBMISSION
```
# WIP
## directFunding
[`/packages/wallet/src/redux/reducers/channels/funding/directFunding.ts`](../src/redux/reducers/channels/funding/directFunding.ts`)
```mermaid
  graph TD
  linkStyle default interpolate basis
    WAIT_FOR_FUNDING_REQUEST -->|FUNDING_REQUESTED| WAIT_FOR_FUNDING_APPROVAL

    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_REJECTED| SEND_FUNDING_DECLINED_MESSAGE
    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_APPROVED| WAIT_FOR_FUNDING_AND_POST_FUND_SETUP
    WAIT_FOR_FUNDING_APPROVAL -->|MESSAGE_RECEIVED| ACKNOWLEDGE_FUNDING_DECLINED
    WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_DECLINED_ACKNOWLEDGED| WAIT_FOR_FUNDING_APPROVAL

    A_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK --> |TRANSACTION_SENT_TO_METAMASK| A_SUBMIT_DEPOSIT_IN_METAMASK
    A_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK --> |FUNDING_RECEIVED_EVENT| A_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK

    A_SUBMIT_DEPOSIT_IN_METAMASK --> |FUNDING_RECEIVED_EVENT| A_SUBMIT_DEPOSIT_IN_METAMASK
    A_SUBMIT_DEPOSIT_IN_METAMASK --> |TRANSACTION_SUBMITTED| A_WAIT_FOR_DEPOSIT_CONFIRMATION
    A_SUBMIT_DEPOSIT_IN_METAMASK --> |TRANSACTION_SUBMISSION_FAILED| A_DEPOSIT_TRANSACTION_FAILED

    A_WAIT_FOR_DEPOSIT_CONFIRMATION --> |FUNDING_RECEIVED_EVENT| A_WAIT_FOR_DEPOSIT_CONFIRMATION
    A_WAIT_FOR_DEPOSIT_CONFIRMATION --> |TRANSACTION_CONFIRMED| A_WAIT_FOR_OPPONENT_DEPOSIT

    A_WAIT_FOR_OPPONENT_DEPOSIT --> |FUNDING_RECEIVED_EVENT| FUNDING_CONFIRMED

    B_WAIT_FOR_OPPONENT_DEPOSIT --> |FUNDING_RECEIVED_EVENT| B_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK

    B_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK --> |TRANSACTION_SENT_TO_METAMASK| B_SUBMIT_DEPOSIT_IN_METAMASK

    B_SUBMIT_DEPOSIT_IN_METAMASK --> |TRANSACTION_SUBMITTED| B_WAIT_FOR_DEPOSIT_CONFIRMATION
    B_SUBMIT_DEPOSIT_IN_METAMASK --> |TRANSACTION_SUBMISSION_FAILED| B_DEPOSIT_TRANSACTION_FAILED

    B_WAIT_FOR_DEPOSIT_CONFIRMATION --> |TRANSACTION_CONFIRMED| FUNDING_CONFIRMED

    A_DEPOSIT_TRANSACTION_FAILED --> |RETRY_TRANSACTION| A_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK

    B_DEPOSIT_TRANSACTION_FAILED --> |RETRY_TRANSACTION| B_WAIT_FOR_DEPOSIT_TO_BE_SENT_TO_METAMASK

    FUNDING_CONFIRMED

```
# The whole thing
Absorb the above as subgraphs of a single diagram:

```mermaid
  graph TD
  linkStyle default interpolate basis
    subgraph openingReducer
      WAIT_FOR_CHANNEL -->|OWN_COMMITMENT_RECEIEVED| WAIT_FOR_PRE_FUND_SETUP
      WAIT_FOR_CHANNEL -->|OPPONENT_COMMITMENT_RECEIEVED| WAIT_FOR_PRE_FUND_SETUP

      WAIT_FOR_PRE_FUND_SETUP -->|OWN_COMMITMENT_RECEIEVED| WAIT_FOR_FUNDING_REQUEST
      WAIT_FOR_PRE_FUND_SETUP -->|OPPONENT_COMMITMENT_RECEIEVED| WAIT_FOR_FUNDING_REQUEST
    end

    subgraph fundingReducer
      WAIT_FOR_FUNDING_REQUEST -->|FUNDING_REQUESTED| WAIT_FOR_FUNDING_APPROVAL

      WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_REJECTED| SEND_FUNDING_DECLINED_MESSAGE
      WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_APPROVED| WAIT_FOR_FUNDING_AND_POST_FUND_SETUP
      WAIT_FOR_FUNDING_APPROVAL -->|MESSAGE_RECEIVED| ACKNOWLEDGE_FUNDING_DECLINED
      WAIT_FOR_FUNDING_APPROVAL -->|FUNDING_DECLINED_ACKNOWLEDGED| WAIT_FOR_FUNDING_APPROVAL

      WAIT_FOR_FUNDING_AND_POST_FUND_SETUP

      WAIT_FOR_FUNDING_CONFIRMATION -->|FUNDING_RECEIVED_EVENT| ACKNOWLEDGE_FUNDING_REQUEST

      A_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| ACKNOWLEDGE_FUNDING_SUCCESS
      A_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| WAIT_FOR_FUNDING_CONFIRMATION

      B_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| B_WAIT_FOR_POST_FUND_SETUP
      B_WAIT_FOR_POST_FUND_SETUP -->|COMMITMENT_RECEIVED| ACKNOWLEDGE_FUNDING_SUCCESS

      ACKNOWLEDGE_FUNDING_SUCCESS -->|FUNDING_SUCCESS_ACKNOWLEDGED| ACKNOWLEDGE_FUNDING_SUCCESS

      SEND_FUNDING_DECLINED_MESSAGE -->|MESSAGE_SENT| SEND_FUNDING_DECLINED_MESSAGE
          
      ACKNOWLEDGE_FUNDING_DECLINED -->|FUNDING_DECLINED_ACKNOWLEDGED| ACKNOWLEDGE_FUNDING_DECLINED 
    end

    subgraph runningReducer %% CONSIDER OMITING
      RUNNING .-> |waitForUpdateReducer|...

      WAIT_FOR_UPDATE --> |OWN_COMMITMENT_RECEIVED| WAIT_FOR_UPDATE
      WAIT_FOR_UPDATE --> |OPPONENT_COMMITMENT_RECEIVED| WAIT_FOR_UPDATE
      WAIT_FOR_UPDATE --> |CHALLENGE_CREATED_EVENT| CHOOSE_RESPONSE
      WAIT_FOR_UPDATE --> |CHALLENGE_REQUESTED| APPROVE_CHALLENGE
    end

    subgraph challengingReducer
      APPROVE_CHALLENGE --> |CHALLENGE_APPROVED|WAIT_FOR_CHALLENGE_INITIATION
      APPROVE_CHALLENGE --> |CHALLENGE_REJECTED|WAIT_FOR_UPDATE

      WAIT_FOR_CHALLENGE_INITIATION --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_CHALLENGE_SUBMISSION

      WAIT_FOR_CHALLENGE_SUBMISSION --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_CHALLENGE_SUBMISSION
      WAIT_FOR_CHALLENGE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_CHALLENGE_CONFIRMATION
      WAIT_FOR_CHALLENGE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| CHALLENGE_TRANSACTION_FAILED

      WAIT_FOR_CHALLENGE_CONFIRMATION --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_CHALLENGE_CONFIRMATION 
      WAIT_FOR_CHALLENGE_CONFIRMATION --> |TRANSACTION_CONFIRMED| WAIT_FOR_RESPONSE_OR_TIMEOUT

      WAIT_FOR_RESPONSE_OR_TIMEOUT --> |CHALLENGE_CREATED_EVENT| WAIT_FOR_RESPONSE_OR_TIMEOUT
      WAIT_FOR_RESPONSE_OR_TIMEOUT --> |RESPOND_WITH_MOVE_EVENT| ACKNOWLEDGE_CHALLENGE_RESPONSE
      WAIT_FOR_RESPONSE_OR_TIMEOUT --> |BLOCK_MINED| ACKNOWLEDGE_TIMEOUT

      ACKNOWLEDGE_CHALLENGE_RESPONSE --> |CHALLENGE_RESPONSE_ACKNOWLEDGED| WAIT_FOR_UPDATE
      
      ACKNOWLEDGE_CHALLENGE_TIMEOUT --> |CHALLENGE_TIME_OUT_ACKNOWLEDGED| APPROVE_WITHDRAWAL
      
      CHALLENGE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| WAIT_FOR_CHALLENGE_INITIATION

    end
    
    subgraph respondingReducer
      CHOOSE_RESPONSE --> |RESPOND_WITH_MOVE_CHOSEN| TAKE_MOVE_IN_APP
      CHOOSE_RESPONSE --> |RESPOND_WITH_EXISTING_MOVE_CHOSEN| INITIATE_RESPONSE
      CHOOSE_RESPONSE --> |RESPOND_WITH_REFUTE_CHOSEN| INITIATE_RESPONSE
      CHOOSE_RESPONSE --> |BLOCK_MINED| CHOOSE_RESPONSE
      CHOOSE_RESPONSE --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

      TAKE_MOVE_IN_APP --> |CHALLENGE_COMMITMENT_RECEIVED| INITIATE_RESPONSE
      TAKE_MOVE_IN_APP --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

      INITIATE_RESPONSE --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_RESPONSE_SUBMISSION
      INITIATE_RESPONSE --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT
      
      WAIT_FOR_RESPONSE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_RESPONSE_CONFIRMATION
      WAIT_FOR_RESPONSE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| RESPSONSE_TRANSACTION_FAILED
      WAIT_FOR_RESPONSE_SUBMISSION --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT

      WAIT_FOR_RESPONSE_CONFIRMATION --> |BLOCK_MINED| CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT
      WAIT_FOR_RESPONSE_CONFIRMATION --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_CHALLENGE_COMPLETE

      
      CHALLENGEE_ACKNOWLEDGE_CHALLENGE_TIMEOUT --> |CHALLENGE_TIME_OUT_ACKNOWLEDGED| APPROVE_WITHDRAWAL
    
      ACKNOWLEDGE_CHALLENGE_COMPLETE --> |CHALLENGE_RESPONSE_ACKNOWLEDGED| WAIT_FOR_UPDATE

      RESPONSE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| INITIATE_RESPONSE
    end

    subgraph withdrawingReducer
      APPROVE_WITHDRAWAL --> |WITHDRAWAL_APPROVED| WAIT_FOR_WITHDRAWAL_INITIATION

      APPROVE_WITHDRAWAL --> |WITHDRAWAL_REJECTED| ACKNOWLEDGE_CLOSE_SUCCESS

      WAIT_FOR_WITHDRAWAL_INITIATION --> |TRANSACTION_SUBMITTED| WAIT_FOR_WITHDRAWAL_CONFIRMATION
      WAIT_FOR_WITHDRAWAL_INITIATION --> |TRANSACTION_SUBMISSION_FAILED| WITHDRAW_TRANSACTION_FAILED

      WAIT_FOR_WITHDRAWAL_CONFIRMATION --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_WITHDRAWAL_SUCCESS 

      ACKNOWLEDGE_WITHDRAWAL_SUCCESS --> |WITHDRAWAL_SUCCESS_ACKNOWLEDGED| WAIT_FOR_CHANNEL

      WITHDRAW_TRANSACTION_FAILED --> |RETRY TRANSACTION| WAIT_FOR_WITHDRAWAL_INITIATION
    end

    subgraph closingReducer
      APPROVE_CONCLUDE --> |CONCLUDE_APPROVED| APPROVE_CLOSE_ON_CHAIN
      APPROVE_CONCLUDE --> |CONCLUDE_APPROVED| WAIT_FOR_OPPONENT_CONCLUDE
      APPROVE_CONCLUDE --> |CONCLUDE_REJECTED| WAIT_FOR_UPDATE

      WAIT_FOR_OPPONENT_CONCLUDE --> |COMMITMENT_RECEIVED| APPROVE_CLOSE_ON_CHAIN

      ACKNOWLEDGE_CLOSE_SUCCESS --> |CLOSE_SUCCESS_ACKNOWLEDGED| WAIT_FOR_CHANNEL

      ACKNOWLEDGE_CLOSED_ON_CHAIN --> |CLOSED_ON_CHAIN_ACKNOWLEDGED| WAIT_FOR_CHANNEL

      APPROVE_CLOSE_ON_CHAIN --> |APPROVE_CLOSE| WAIT_FOR_CLOSE_INITIATION

      WAIT_FOR_CLOSE_INITIATION --> |TRANSACTION_SENT_TO_METAMASK| WAIT_FOR_CLOSE_SUBMISSION

      WAIT_FOR_CLOSE_SUBMISSION --> |TRANSACTION_SUBMISSION_FAILED| CLOSE_TRANSACTION_FAILED
      WAIT_FOR_CLOSE_SUBMISSION --> |TRANSACTION_SUBMITTED| WAIT_FOR_CLOSE_CONFIRMED

      WAIT_FOR_CLOSE_CONFIRMED --> |TRANSACTION_CONFIRMED| ACKNOWLEDGE_CLOSE_SUCCESS

      ACKNOWLEDGE_CONCLUDE --> |CONCLUDE_APPROVED| APPROVE_CLOSE_ON_CHAIN

      CLOSE_TRANSACTION_FAILED --> |RETRY_TRANSACTION| WAIT_FOR_CLOSE_SUBMISSION

    end
  
```