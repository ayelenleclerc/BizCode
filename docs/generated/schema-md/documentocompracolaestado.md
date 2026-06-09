# DocumentoCompraColaEstado Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraColaEstado.schema.json](../schema-json/DocumentoCompraColaEstado.schema.json "open original schema") |

## DocumentoCompraColaEstado Type

`object` ([DocumentoCompraColaEstado](documentocompracolaestado.md))

# DocumentoCompraColaEstado Properties

| Property                                   | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :----------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [confirmado](#confirmado)                  | `integer` | Required | cannot be null | [DocumentoCompraColaEstado](documentocompracolaestado-properties-confirmado.md "undefined#/properties/confirmado")                 |
| [descartado](#descartado)                  | `integer` | Required | cannot be null | [DocumentoCompraColaEstado](documentocompracolaestado-properties-descartado.md "undefined#/properties/descartado")                 |
| [documentos](#documentos)                  | `array`   | Required | cannot be null | [DocumentoCompraColaEstado](documentocompracolaestado-properties-documentos.md "undefined#/properties/documentos")                 |
| [pendiente\_revision](#pendiente_revision) | `integer` | Required | cannot be null | [DocumentoCompraColaEstado](documentocompracolaestado-properties-pendiente_revision.md "undefined#/properties/pendiente_revision") |
| [procesando](#procesando)                  | `integer` | Required | cannot be null | [DocumentoCompraColaEstado](documentocompracolaestado-properties-procesando.md "undefined#/properties/procesando")                 |

## confirmado



`confirmado`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraColaEstado](documentocompracolaestado-properties-confirmado.md "undefined#/properties/confirmado")

### confirmado Type

`integer`

### confirmado Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## descartado



`descartado`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraColaEstado](documentocompracolaestado-properties-descartado.md "undefined#/properties/descartado")

### descartado Type

`integer`

### descartado Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## documentos



`documentos`

* is required

* Type: `object[]` ([DocumentoCompraImportado](documentocompraimportado.md))

* cannot be null

* defined in: [DocumentoCompraColaEstado](documentocompracolaestado-properties-documentos.md "undefined#/properties/documentos")

### documentos Type

`object[]` ([DocumentoCompraImportado](documentocompraimportado.md))

## pendiente\_revision



`pendiente_revision`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraColaEstado](documentocompracolaestado-properties-pendiente_revision.md "undefined#/properties/pendiente_revision")

### pendiente\_revision Type

`integer`

### pendiente\_revision Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## procesando



`procesando`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraColaEstado](documentocompracolaestado-properties-procesando.md "undefined#/properties/procesando")

### procesando Type

`integer`

### procesando Constraints

**minimum**: the value of this number must greater than or equal to: `0`
