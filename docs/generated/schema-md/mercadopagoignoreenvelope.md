# MercadoPagoIgnoreEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoIgnoreEnvelope.schema.json](../schema-json/MercadoPagoIgnoreEnvelope.schema.json "open original schema") |

## MercadoPagoIgnoreEnvelope Type

`object` ([MercadoPagoIgnoreEnvelope](mercadopagoignoreenvelope.md))

# MercadoPagoIgnoreEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoIgnoreEnvelope](mercadopagoignoreresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoIgnoreEnvelope](mercadopagoignoreenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoIgnoreResult](mercadopagoignoreresult.md))

* cannot be null

* defined in: [MercadoPagoIgnoreEnvelope](mercadopagoignoreresult.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoIgnoreResult](mercadopagoignoreresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoIgnoreEnvelope](mercadopagoignoreenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
