# DocumentoCompraDuplicadoResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraDuplicadoResult.schema.json](../schema-json/DocumentoCompraDuplicadoResult.schema.json "open original schema") |

## DocumentoCompraDuplicadoResult Type

`object` ([DocumentoCompraDuplicadoResult](documentocompraduplicadoresult.md))

# DocumentoCompraDuplicadoResult Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                                                     |
| :------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [comprobanteCompraId](#comprobantecompraid) | `integer` | Required | can be null    | [DocumentoCompraDuplicadoResult](documentocompraduplicadoresult-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId") |
| [duplicado](#duplicado)                     | `boolean` | Required | cannot be null | [DocumentoCompraDuplicadoResult](documentocompraduplicadoresult-properties-duplicado.md "undefined#/properties/duplicado")                     |

## comprobanteCompraId



`comprobanteCompraId`

* is required

* Type: `integer`

* can be null

* defined in: [DocumentoCompraDuplicadoResult](documentocompraduplicadoresult-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId")

### comprobanteCompraId Type

`integer`

### comprobanteCompraId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## duplicado



`duplicado`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraDuplicadoResult](documentocompraduplicadoresult-properties-duplicado.md "undefined#/properties/duplicado")

### duplicado Type

`boolean`
