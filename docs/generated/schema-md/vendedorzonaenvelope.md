# VendedorZonaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VendedorZonaEnvelope.schema.json](../schema-json/VendedorZonaEnvelope.schema.json "open original schema") |

## VendedorZonaEnvelope Type

`object` ([VendedorZonaEnvelope](vendedorzonaenvelope.md))

# VendedorZonaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [VendedorZonaEnvelope](vendedorzona.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [VendedorZonaEnvelope](vendedorzonaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([VendedorZona](vendedorzona.md))

* cannot be null

* defined in: [VendedorZonaEnvelope](vendedorzona.md "undefined#/properties/data")

### data Type

`object` ([VendedorZona](vendedorzona.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [VendedorZonaEnvelope](vendedorzonaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
