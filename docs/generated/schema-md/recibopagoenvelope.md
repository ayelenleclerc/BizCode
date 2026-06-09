# ReciboPagoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboPagoEnvelope.schema.json](../schema-json/ReciboPagoEnvelope.schema.json "open original schema") |

## ReciboPagoEnvelope Type

`object` ([ReciboPagoEnvelope](recibopagoenvelope.md))

# ReciboPagoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ReciboPagoEnvelope](recibopago.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ReciboPagoEnvelope](recibopagoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ReciboPago](recibopago.md))

* cannot be null

* defined in: [ReciboPagoEnvelope](recibopago.md "undefined#/properties/data")

### data Type

`object` ([ReciboPago](recibopago.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReciboPagoEnvelope](recibopagoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
