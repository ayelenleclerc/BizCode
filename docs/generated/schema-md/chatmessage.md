# ChatMessage Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatMessageListEnvelope.schema.json\*](../schema-json/ChatMessageListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ChatMessage](chatmessage.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [content](#content)       | `string`  | Optional | cannot be null | [ChatMessage](chatmessage-properties-content.md "undefined#/properties/content")       |
| [createdAt](#createdat)   | `string`  | Optional | cannot be null | [ChatMessage](chatmessage-properties-createdat.md "undefined#/properties/createdAt")   |
| [fromUserId](#fromuserid) | `integer` | Optional | cannot be null | [ChatMessage](chatmessage-properties-fromuserid.md "undefined#/properties/fromUserId") |
| [id](#id)                 | `integer` | Optional | cannot be null | [ChatMessage](chatmessage-properties-id.md "undefined#/properties/id")                 |
| [tenantId](#tenantid)     | `integer` | Optional | cannot be null | [ChatMessage](chatmessage-properties-tenantid.md "undefined#/properties/tenantId")     |
| [toUserId](#touserid)     | `integer` | Optional | cannot be null | [ChatMessage](chatmessage-properties-touserid.md "undefined#/properties/toUserId")     |

## content



`content`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-content.md "undefined#/properties/content")

### content Type

`string`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fromUserId



`fromUserId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-fromuserid.md "undefined#/properties/fromUserId")

### fromUserId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## toUserId



`toUserId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatMessage](chatmessage-properties-touserid.md "undefined#/properties/toUserId")

### toUserId Type

`integer`
