# ArticuloProveedoresComparadorEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloProveedoresComparadorEnvelope.schema.json](../schema-json/ArticuloProveedoresComparadorEnvelope.schema.json "open original schema") |

## ArticuloProveedoresComparadorEnvelope Type

`object` ([ArticuloProveedoresComparadorEnvelope](articuloproveedorescomparadorenvelope.md))

# ArticuloProveedoresComparadorEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ArticuloProveedoresComparadorEnvelope](articuloproveedorescomparadordata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ArticuloProveedoresComparadorEnvelope](articuloproveedorescomparadorenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ArticuloProveedoresComparadorData](articuloproveedorescomparadordata.md))

* cannot be null

* defined in: [ArticuloProveedoresComparadorEnvelope](articuloproveedorescomparadordata.md "undefined#/properties/data")

### data Type

`object` ([ArticuloProveedoresComparadorData](articuloproveedorescomparadordata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloProveedoresComparadorEnvelope](articuloproveedorescomparadorenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
