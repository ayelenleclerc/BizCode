# WhatsAppShareEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WhatsAppShareEnvelope.schema.json](../schema-json/WhatsAppShareEnvelope.schema.json "open original schema") |

## WhatsAppShareEnvelope Type

`object` ([WhatsAppShareEnvelope](whatsappshareenvelope.md))

# WhatsAppShareEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [WhatsAppShareEnvelope](whatsappsharepreview.md "undefined#/properties/data")                        |
| [success](#success) | `boolean` | Required | cannot be null | [WhatsAppShareEnvelope](whatsappshareenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([WhatsAppSharePreview](whatsappsharepreview.md))

* cannot be null

* defined in: [WhatsAppShareEnvelope](whatsappsharepreview.md "undefined#/properties/data")

### data Type

`object` ([WhatsAppSharePreview](whatsappsharepreview.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WhatsAppShareEnvelope](whatsappshareenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
