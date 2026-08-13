# WhatsAppSendBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [WhatsAppSendBody.schema.json](../schema-json/WhatsAppSendBody.schema.json "open original schema") |

## WhatsAppSendBody Type

`object` ([WhatsAppSendBody](whatsappsendbody.md))

# WhatsAppSendBody Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                             |
| :-------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [canal](#canal) | `string` | Required | cannot be null | [WhatsAppSendBody](whatsappsendbody-properties-canal.md "undefined#/properties/canal") |

## canal



`canal`

* is required

* Type: `string`

* cannot be null

* defined in: [WhatsAppSendBody](whatsappsendbody-properties-canal.md "undefined#/properties/canal")

### canal Type

`string`

### canal Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"link"`   |             |
| `"twilio"` |             |
