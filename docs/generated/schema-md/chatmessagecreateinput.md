# ChatMessageCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatMessageCreateInput.schema.json](../schema-json/ChatMessageCreateInput.schema.json "open original schema") |

## ChatMessageCreateInput Type

`object` ([ChatMessageCreateInput](chatmessagecreateinput.md))

# ChatMessageCreateInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                               |
| :-------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [content](#content)   | `string`  | Required | cannot be null | [ChatMessageCreateInput](chatmessagecreateinput-properties-content.md "undefined#/properties/content")   |
| [toUserId](#touserid) | `integer` | Required | cannot be null | [ChatMessageCreateInput](chatmessagecreateinput-properties-touserid.md "undefined#/properties/toUserId") |

## content



`content`

* is required

* Type: `string`

* cannot be null

* defined in: [ChatMessageCreateInput](chatmessagecreateinput-properties-content.md "undefined#/properties/content")

### content Type

`string`

### content Constraints

**maximum length**: the maximum number of characters for this string is: `1000`

**minimum length**: the minimum number of characters for this string is: `1`

## toUserId



`toUserId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ChatMessageCreateInput](chatmessagecreateinput-properties-touserid.md "undefined#/properties/toUserId")

### toUserId Type

`integer`

### toUserId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
