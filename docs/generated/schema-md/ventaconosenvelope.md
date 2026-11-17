# VentaConOSEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VentaConOSEnvelope.schema.json](../schema-json/VentaConOSEnvelope.schema.json "open original schema") |

## VentaConOSEnvelope Type

`object` ([VentaConOSEnvelope](ventaconosenvelope.md))

# VentaConOSEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [VentaConOSEnvelope](ventaconos.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [VentaConOSEnvelope](ventaconosenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([VentaConOS](ventaconos.md))

* cannot be null

* defined in: [VentaConOSEnvelope](ventaconos.md "undefined#/properties/data")

### data Type

`object` ([VentaConOS](ventaconos.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [VentaConOSEnvelope](ventaconosenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
