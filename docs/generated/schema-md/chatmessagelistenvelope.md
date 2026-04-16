# ChatMessageListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatMessageListEnvelope.schema.json](../schema-json/ChatMessageListEnvelope.schema.json "open original schema") |

## ChatMessageListEnvelope Type

`object` ([ChatMessageListEnvelope](chatmessagelistenvelope.md))

# ChatMessageListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ChatMessageListEnvelope](chatmessagelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ChatMessageListEnvelope](chatmessagelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ChatMessage](chatmessage.md))

* cannot be null

* defined in: [ChatMessageListEnvelope](chatmessagelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ChatMessage](chatmessage.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ChatMessageListEnvelope](chatmessagelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
