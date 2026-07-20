# FormaPagoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormaPagoEnvelope.schema.json](../schema-json/FormaPagoEnvelope.schema.json "open original schema") |

## FormaPagoEnvelope Type

`object` ([FormaPagoEnvelope](formapagoenvelope.md))

# FormaPagoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FormaPagoEnvelope](formapago.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [FormaPagoEnvelope](formapagoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FormaPago](formapago.md))

* cannot be null

* defined in: [FormaPagoEnvelope](formapago.md "undefined#/properties/data")

### data Type

`object` ([FormaPago](formapago.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FormaPagoEnvelope](formapagoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
