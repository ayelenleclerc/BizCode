# DocumentoCompraPreviewData Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraPreviewData.schema.json](../schema-json/DocumentoCompraPreviewData.schema.json "open original schema") |

## DocumentoCompraPreviewData Type

`object` ([DocumentoCompraPreviewData](documentocomprapreviewdata.md))

# DocumentoCompraPreviewData Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [cae](#cae)                           | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-cae.md "undefined#/properties/cae")                           |
| [caeVto](#caevto)                     | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-caevto.md "undefined#/properties/caeVto")                     |
| [cuitExtracted](#cuitextracted)       | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-cuitextracted.md "undefined#/properties/cuitExtracted")       |
| [fecha](#fecha)                       | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-fecha.md "undefined#/properties/fecha")                       |
| [fieldConfidence](#fieldconfidence)   | `object`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-fieldconfidence.md "undefined#/properties/fieldConfidence")   |
| [items](#items)                       | `array`   | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-items.md "undefined#/properties/items")                       |
| [iva1](#iva1)                         | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-iva1.md "undefined#/properties/iva1")                         |
| [iva2](#iva2)                         | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-iva2.md "undefined#/properties/iva2")                         |
| [neto1](#neto1)                       | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto1.md "undefined#/properties/neto1")                       |
| [neto2](#neto2)                       | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto2.md "undefined#/properties/neto2")                       |
| [neto3](#neto3)                       | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto3.md "undefined#/properties/neto3")                       |
| [numero](#numero)                     | `integer` | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-numero.md "undefined#/properties/numero")                     |
| [prefijo](#prefijo)                   | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-prefijo.md "undefined#/properties/prefijo")                   |
| [proveedorId](#proveedorid)           | `integer` | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-proveedorid.md "undefined#/properties/proveedorId")           |
| [rsocialExtracted](#rsocialextracted) | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-rsocialextracted.md "undefined#/properties/rsocialExtracted") |
| [tipo](#tipo)                         | Merged    | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-tipo.md "undefined#/properties/tipo")                         |
| [total](#total)                       | `number`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-total.md "undefined#/properties/total")                       |
| [vencimiento](#vencimiento)           | `string`  | Optional | cannot be null | [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-vencimiento.md "undefined#/properties/vencimiento")           |

## cae



`cae`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-cae.md "undefined#/properties/cae")

### cae Type

`string`

## caeVto



`caeVto`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-caevto.md "undefined#/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## cuitExtracted

Supplier tax id digits extracted when no match (#277 Fase F)

`cuitExtracted`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-cuitextracted.md "undefined#/properties/cuitExtracted")

### cuitExtracted Type

`string`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fieldConfidence



`fieldConfidence`

* is optional

* Type: `object` ([Details](documentocomprapreviewdata-properties-fieldconfidence.md))

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-fieldconfidence.md "undefined#/properties/fieldConfidence")

### fieldConfidence Type

`object` ([Details](documentocomprapreviewdata-properties-fieldconfidence.md))

## items



`items`

* is optional

* Type: `object[]` ([DocumentoCompraItemPreview](documentocompraitempreview.md))

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([DocumentoCompraItemPreview](documentocompraitempreview.md))

## iva1



`iva1`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`number`

## iva2



`iva2`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`number`

## neto1



`neto1`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`number`

## neto2



`neto2`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`number`

## neto3



`neto3`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-neto3.md "undefined#/properties/neto3")

### neto3 Type

`number`

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## rsocialExtracted

Supplier name hint from OCR/LLM (#277 Fase F)

`rsocialExtracted`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-rsocialextracted.md "undefined#/properties/rsocialExtracted")

### rsocialExtracted Type

`string`

## tipo



`tipo`

* is optional

* Type: merged type ([Details](documentocomprapreviewdata-properties-tipo.md))

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

merged type ([Details](documentocomprapreviewdata-properties-tipo.md))

any of

* [Untitled string in DocumentoCompraPreviewData](documentocomprapreviewdata-properties-tipo-anyof-0.md "check type definition")

* [Untitled null in DocumentoCompraPreviewData](documentocomprapreviewdata-properties-tipo-anyof-1.md "check type definition")

## total



`total`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-total.md "undefined#/properties/total")

### total Type

`number`

## vencimiento



`vencimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraPreviewData](documentocomprapreviewdata-properties-vencimiento.md "undefined#/properties/vencimiento")

### vencimiento Type

`string`

### vencimiento Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
