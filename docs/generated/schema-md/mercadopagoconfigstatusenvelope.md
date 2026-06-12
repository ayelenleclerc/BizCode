# MercadoPagoConfigStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoConfigStatusEnvelope.schema.json](../schema-json/MercadoPagoConfigStatusEnvelope.schema.json "open original schema") |

## MercadoPagoConfigStatusEnvelope Type

`object` ([MercadoPagoConfigStatusEnvelope](mercadopagoconfigstatusenvelope.md))

# MercadoPagoConfigStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoConfigStatusEnvelope](mercadopagoconfigstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoConfigStatusEnvelope](mercadopagoconfigstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoConfigStatus](mercadopagoconfigstatus.md))

* cannot be null

* defined in: [MercadoPagoConfigStatusEnvelope](mercadopagoconfigstatus.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoConfigStatus](mercadopagoconfigstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoConfigStatusEnvelope](mercadopagoconfigstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
