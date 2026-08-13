# WhatsAppSharePreview Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WhatsAppSharePreview.schema.json](../schema-json/WhatsAppSharePreview.schema.json "open original schema") |

## WhatsAppSharePreview Type

`object` ([WhatsAppSharePreview](whatsappsharepreview.md))

# WhatsAppSharePreview Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :---------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [phone](#phone)                     | `string`  | Required | cannot be null | [WhatsAppSharePreview](whatsappsharepreview-properties-phone.md "undefined#/properties/phone")                     |
| [reason](#reason)                   | `string`  | Optional | cannot be null | [WhatsAppSharePreview](whatsappsharepreview-properties-reason.md "undefined#/properties/reason")                   |
| [text](#text)                       | `string`  | Required | cannot be null | [WhatsAppSharePreview](whatsappsharepreview-properties-text.md "undefined#/properties/text")                       |
| [twilioAvailable](#twilioavailable) | `boolean` | Required | cannot be null | [WhatsAppSharePreview](whatsappsharepreview-properties-twilioavailable.md "undefined#/properties/twilioAvailable") |
| [waMeUrl](#wameurl)                 | `string`  | Required | cannot be null | [WhatsAppSharePreview](whatsappsharepreview-properties-wameurl.md "undefined#/properties/waMeUrl")                 |

## phone

Digits-only Cliente.telef; empty when missing.

`phone`

* is required

* Type: `string`

* cannot be null

* defined in: [WhatsAppSharePreview](whatsappsharepreview-properties-phone.md "undefined#/properties/phone")

### phone Type

`string`

## reason



`reason`

* is optional

* Type: `string`

* cannot be null

* defined in: [WhatsAppSharePreview](whatsappsharepreview-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"no_phone"` |             |

## text



`text`

* is required

* Type: `string`

* cannot be null

* defined in: [WhatsAppSharePreview](whatsappsharepreview-properties-text.md "undefined#/properties/text")

### text Type

`string`

### text Constraints

**maximum length**: the maximum number of characters for this string is: `1024`

## twilioAvailable



`twilioAvailable`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WhatsAppSharePreview](whatsappsharepreview-properties-twilioavailable.md "undefined#/properties/twilioAvailable")

### twilioAvailable Type

`boolean`

## waMeUrl



`waMeUrl`

* is required

* Type: `string`

* cannot be null

* defined in: [WhatsAppSharePreview](whatsappsharepreview-properties-wameurl.md "undefined#/properties/waMeUrl")

### waMeUrl Type

`string`
