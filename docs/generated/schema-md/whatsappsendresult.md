# WhatsAppSendResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WhatsAppSendResult.schema.json](../schema-json/WhatsAppSendResult.schema.json "open original schema") |

## WhatsAppSendResult Type

`object` ([WhatsAppSendResult](whatsappsendresult.md))

# WhatsAppSendResult Properties

| Property        | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [canal](#canal) | `string`  | Required | cannot be null | [WhatsAppSendResult](whatsappsendresult-properties-canal.md "undefined#/properties/canal") |
| [sent](#sent)   | `boolean` | Required | cannot be null | [WhatsAppSendResult](whatsappsendresult-properties-sent.md "undefined#/properties/sent")   |

## canal



`canal`

* is required

* Type: `string`

* cannot be null

* defined in: [WhatsAppSendResult](whatsappsendresult-properties-canal.md "undefined#/properties/canal")

### canal Type

`string`

### canal Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"link"`   |             |
| `"twilio"` |             |

## sent



`sent`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WhatsAppSendResult](whatsappsendresult-properties-sent.md "undefined#/properties/sent")

### sent Type

`boolean`
