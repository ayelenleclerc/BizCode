# CobranzasVencidasEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobranzasVencidasEnvelope.schema.json](../schema-json/CobranzasVencidasEnvelope.schema.json "open original schema") |

## CobranzasVencidasEnvelope Type

`object` ([CobranzasVencidasEnvelope](cobranzasvencidasenvelope.md))

# CobranzasVencidasEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [CobranzasVencidasEnvelope](cobranzasvencidasenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [CobranzasVencidasEnvelope](cobranzasvencidasenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([FacturaVencidaRow](facturavencidarow.md))

* cannot be null

* defined in: [CobranzasVencidasEnvelope](cobranzasvencidasenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([FacturaVencidaRow](facturavencidarow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CobranzasVencidasEnvelope](cobranzasvencidasenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
