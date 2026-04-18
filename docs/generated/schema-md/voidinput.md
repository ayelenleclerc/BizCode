# VoidInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VoidInput.schema.json](../schema-json/VoidInput.schema.json "open original schema") |

## VoidInput Type

`object` ([VoidInput](voidinput.md))

# VoidInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                 |
| :---------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------- |
| [motivo](#motivo) | `string` | Required | cannot be null | [VoidInput](voidinput-properties-motivo.md "undefined#/properties/motivo") |

## motivo

Reason for voiding the invoice. Stored in AuditEvent metadata.

`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [VoidInput](voidinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `500`

**minimum length**: the minimum number of characters for this string is: `1`
