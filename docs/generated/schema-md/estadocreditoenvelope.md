# EstadoCreditoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EstadoCreditoEnvelope.schema.json](../schema-json/EstadoCreditoEnvelope.schema.json "open original schema") |

## EstadoCreditoEnvelope Type

`object` ([EstadoCreditoEnvelope](estadocreditoenvelope.md))

# EstadoCreditoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [EstadoCreditoEnvelope](estadocredito.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [EstadoCreditoEnvelope](estadocreditoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([EstadoCredito](estadocredito.md))

* cannot be null

* defined in: [EstadoCreditoEnvelope](estadocredito.md "undefined#/properties/data")

### data Type

`object` ([EstadoCredito](estadocredito.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [EstadoCreditoEnvelope](estadocreditoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
