# Concluding Protocol (Responder)

The purpose of this protocol is to respond to the instigation of a concluding a channel, i.e. your opponent's move to a conclude state.

It covers:

- Assume a conclude commitment has already been received and a higher level process has then triggered this protocol
- Asking user to confirm the resignation (probably displaying the current outcome)
- Formulating the conclude state and sending to the opponent
- Acknowledge channel concluded (giving the option to defund)

Out of scope (for the time being):

- Allowing responder to not conclude
- Allowing the user to not choose to not defund

## State machine

The protocol is implemented with the following state machine

```mermaid
graph TD
  S((Start)) --> E{Channel Exists?}
  E --> |No| AF(AcknowledgeFailure)
  AF -->|ACKNOWLEDGED| F((Failure))
  E --> |Yes| MT{My turn?}
  MT  --> |Yes| CC(ApproveConcluding)
  MT  --> |No| AF(AcknowledgeFailure)
  CC  --> |CONCLUDE.SENT| DD(DecideDefund)
  DD --> |DEFUND.CHOSEN| D(WaitForDefund)
  D   --> |defunding protocol succeeded| AS(AcknowledgeSuccess)
  AS -->  |ACKNOWLEDGED| SS((Success))
  D   --> |defunding protocol failed| AF(AcknowledgeFailure)
  style S  fill:#efdd20
  style E  fill:#efdd20
  style MT fill:#efdd20
  style SS fill:#58ef21
  style F  fill:#f45941
  style D stroke:#333,stroke-width:4px
```

## Scenarios

We will use the following scenarios for testing:

1. **Happy path**: `ApproveConcluding` -> `DecideDefund` -> `WaitForDefund` -> `AcknowledgeSuccess` -> `Success`
2. **Channel doesnt exist** `AcknowledgeFailure` -> `Failure`
3. **Concluding not possible**: `AcknowledgeFailure` -> `Failure`
4. **Defund failed** `WaitForDefund` -> `AcknowledgeFailure` -> `Failure`

# Terminology

Use "Conclude" / "Concluding" everywhere, here. In an application, you might choose to Resign, or you (or an opponent) might run out of funds. In these cases, according to the wallet you are concluding the channel.

For now we will avoid "Resigning", "Closing" and so on.

We will also include the `Defunding` protocol as an optional subprotocol of `Concluding`. If `Defunding` fails, `Concluding` will still be considered to have also failed.