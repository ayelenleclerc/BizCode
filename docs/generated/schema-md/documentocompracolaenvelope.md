# DocumentoCompraColaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraColaEnvelope.schema.json](../schema-json/DocumentoCompraColaEnvelope.schema.json "open original schema") |

## DocumentoCompraColaEnvelope Type

`object` ([DocumentoCompraColaEnvelope](documentocompracolaenvelope.md))

# DocumentoCompraColaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DocumentoCompraColaEnvelope](documentocompracolaestado.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraColaEnvelope](documentocompracolaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DocumentoCompraColaEstado](documentocompracolaestado.md))

* cannot be null

* defined in: [DocumentoCompraColaEnvelope](documentocompracolaestado.md "undefined#/properties/data")

### data Type

`object` ([DocumentoCompraColaEstado](documentocompracolaestado.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraColaEnvelope](documentocompracolaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
