# ComprobanteCompraEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComprobanteCompraEnvelope.schema.json](../schema-json/ComprobanteCompraEnvelope.schema.json "open original schema") |

## ComprobanteCompraEnvelope Type

`object` ([ComprobanteCompraEnvelope](comprobantecompraenvelope.md))

# ComprobanteCompraEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ComprobanteCompraEnvelope](comprobantecompra.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ComprobanteCompraEnvelope](comprobantecompraenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ComprobanteCompra](comprobantecompra.md))

* cannot be null

* defined in: [ComprobanteCompraEnvelope](comprobantecompra.md "undefined#/properties/data")

### data Type

`object` ([ComprobanteCompra](comprobantecompra.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ComprobanteCompraEnvelope](comprobantecompraenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
