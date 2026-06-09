# DocumentoCompraConfirmResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraConfirmResult.schema.json](../schema-json/DocumentoCompraConfirmResult.schema.json "open original schema") |

## DocumentoCompraConfirmResult Type

`object` ([DocumentoCompraConfirmResult](documentocompraconfirmresult.md))

# DocumentoCompraConfirmResult Properties

| Property                                | Type     | Required | Nullable       | Defined by                                                                                     |
| :-------------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [comprobanteCompra](#comprobantecompra) | `object` | Required | cannot be null | [DocumentoCompraConfirmResult](comprobantecompra.md "undefined#/properties/comprobanteCompra") |
| [documento](#documento)                 | `object` | Required | cannot be null | [DocumentoCompraConfirmResult](documentocompraimportado.md "undefined#/properties/documento")  |

## comprobanteCompra



`comprobanteCompra`

* is required

* Type: `object` ([ComprobanteCompra](comprobantecompra.md))

* cannot be null

* defined in: [DocumentoCompraConfirmResult](comprobantecompra.md "undefined#/properties/comprobanteCompra")

### comprobanteCompra Type

`object` ([ComprobanteCompra](comprobantecompra.md))

## documento



`documento`

* is required

* Type: `object` ([DocumentoCompraImportado](documentocompraimportado.md))

* cannot be null

* defined in: [DocumentoCompraConfirmResult](documentocompraimportado.md "undefined#/properties/documento")

### documento Type

`object` ([DocumentoCompraImportado](documentocompraimportado.md))
