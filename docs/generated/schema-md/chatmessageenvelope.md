# ChatMessageEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatMessageEnvelope.schema.json](../schema-json/ChatMessageEnvelope.schema.json "open original schema") |

## ChatMessageEnvelope Type

`object` ([ChatMessageEnvelope](chatmessageenvelope.md))

# ChatMessageEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ChatMessageEnvelope](chatmessage.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ChatMessageEnvelope](chatmessageenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ChatMessage](chatmessage.md))

* cannot be null

* defined in: [ChatMessageEnvelope](chatmessage.md "undefined#/properties/data")

### data Type

`object` ([ChatMessage](chatmessage.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ChatMessageEnvelope](chatmessageenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
