# OrdenCompraEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenCompraEnvelope.schema.json](../schema-json/OrdenCompraEnvelope.schema.json "open original schema") |

## OrdenCompraEnvelope Type

`object` ([OrdenCompraEnvelope](ordencompraenvelope.md))

# OrdenCompraEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [OrdenCompraEnvelope](ordencompra.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [OrdenCompraEnvelope](ordencompraenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([OrdenCompra](ordencompra.md))

* cannot be null

* defined in: [OrdenCompraEnvelope](ordencompra.md "undefined#/properties/data")

### data Type

`object` ([OrdenCompra](ordencompra.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenCompraEnvelope](ordencompraenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
