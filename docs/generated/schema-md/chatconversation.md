# ChatConversation Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChatConversationListEnvelope.schema.json\*](../schema-json/ChatConversationListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ChatConversation](chatconversation.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [lastMessage](#lastmessage) | Merged    | Optional | cannot be null | [ChatConversation](chatconversation-properties-lastmessage.md "undefined#/properties/lastMessage") |
| [unreadCount](#unreadcount) | `integer` | Optional | cannot be null | [ChatConversation](chatconversation-properties-unreadcount.md "undefined#/properties/unreadCount") |
| [user](#user)               | `object`  | Optional | cannot be null | [ChatConversation](chatconversation-properties-user.md "undefined#/properties/user")               |

## lastMessage



`lastMessage`

* is optional

* Type: merged type ([Details](chatconversation-properties-lastmessage.md))

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-lastmessage.md "undefined#/properties/lastMessage")

### lastMessage Type

merged type ([Details](chatconversation-properties-lastmessage.md))

any of

* [Untitled null in ChatConversation](chatconversation-properties-lastmessage-anyof-0.md "check type definition")

* [Untitled object in ChatConversation](chatconversation-properties-lastmessage-anyof-1.md "check type definition")

## unreadCount



`unreadCount`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-unreadcount.md "undefined#/properties/unreadCount")

### unreadCount Type

`integer`

### unreadCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## user



`user`

* is optional

* Type: `object` ([Details](chatconversation-properties-user.md))

* cannot be null

* defined in: [ChatConversation](chatconversation-properties-user.md "undefined#/properties/user")

### user Type

`object` ([Details](chatconversation-properties-user.md))
