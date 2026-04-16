# Untitled object in ChatConversation Schema

```txt
undefined#/properties/lastMessage/anyOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatConversation.schema.json\*](../schema-json/ChatConversation.schema.json "open original schema") |

## 1 Type

`object` ([Details](chatconversation-properties-lastmessage-anyof-1.md))

# 1 Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                                                     |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)   | `string`  | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-createdat.md "undefined#/properties/lastMessage/anyOf/1/properties/createdAt")   |
| [fromUserId](#fromuserid) | `integer` | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-fromuserid.md "undefined#/properties/lastMessage/anyOf/1/properties/fromUserId") |
| [id](#id)                 | `integer` | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-id.md "undefined#/properties/lastMessage/anyOf/1/properties/id")                 |
| [preview](#preview)       | `string`  | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-preview.md "undefined#/properties/lastMessage/anyOf/1/properties/preview")       |
| [toUserId](#touserid)     | `integer` | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-touserid.md "undefined#/properties/lastMessage/anyOf/1/properties/toUserId")     |

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-createdat.md "undefined#/properties/lastMessage/anyOf/1/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fromUserId



`fromUserId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-fromuserid.md "undefined#/properties/lastMessage/anyOf/1/properties/fromUserId")

### fromUserId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-id.md "undefined#/properties/lastMessage/anyOf/1/properties/id")

### id Type

`integer`

## preview



`preview`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-preview.md "undefined#/properties/lastMessage/anyOf/1/properties/preview")

### preview Type

`string`

## toUserId



`toUserId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage-anyof-1-properties-touserid.md "undefined#/properties/lastMessage/anyOf/1/properties/toUserId")

### toUserId Type

`integer`
