# FormaPagoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormaPagoListEnvelope.schema.json](../schema-json/FormaPagoListEnvelope.schema.json "open original schema") |

## FormaPagoListEnvelope Type

`object` ([FormaPagoListEnvelope](formapagolistenvelope.md))

# FormaPagoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FormaPagoListEnvelope](formapagolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FormaPagoListEnvelope](formapagolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([FormaPago](formapago.md))

* cannot be null

* defined in: [FormaPagoListEnvelope](formapagolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([FormaPago](formapago.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FormaPagoListEnvelope](formapagolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
