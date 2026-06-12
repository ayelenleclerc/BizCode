# MercadoPagoConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoConfigEnvelope.schema.json](../schema-json/MercadoPagoConfigEnvelope.schema.json "open original schema") |

## MercadoPagoConfigEnvelope Type

`object` ([MercadoPagoConfigEnvelope](mercadopagoconfigenvelope.md))

# MercadoPagoConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoConfigEnvelope](mercadopagoconfigenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoConfigEnvelope](mercadopagoconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](mercadopagoconfigenvelope-properties-data.md))

* cannot be null

* defined in: [MercadoPagoConfigEnvelope](mercadopagoconfigenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](mercadopagoconfigenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoConfigEnvelope](mercadopagoconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
