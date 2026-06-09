# DocumentoCompraItemPreview Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraItemPreview.schema.json](../schema-json/DocumentoCompraItemPreview.schema.json "open original schema") |

## DocumentoCompraItemPreview Type

`object` ([DocumentoCompraItemPreview](documentocompraitempreview.md))

# DocumentoCompraItemPreview Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Optional | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidad](#cantidad)             | `number`  | Required | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-cantidad.md "undefined#/properties/cantidad")             |
| [confianza](#confianza)           | `number`  | Optional | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-confianza.md "undefined#/properties/confianza")           |
| [descripcion](#descripcion)       | `string`  | Required | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-descripcion.md "undefined#/properties/descripcion")       |
| [precioUnitario](#preciounitario) | `number`  | Required | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-preciounitario.md "undefined#/properties/precioUnitario") |
| [subtotal](#subtotal)             | `number`  | Required | cannot be null | [DocumentoCompraItemPreview](documentocompraitempreview-properties-subtotal.md "undefined#/properties/subtotal")             |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## confianza



`confianza`

* is optional

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-confianza.md "undefined#/properties/confianza")

### confianza Type

`number`

### confianza Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## precioUnitario



`precioUnitario`

* is required

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-preciounitario.md "undefined#/properties/precioUnitario")

### precioUnitario Type

`number`

## subtotal



`subtotal`

* is required

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraItemPreview](documentocompraitempreview-properties-subtotal.md "undefined#/properties/subtotal")

### subtotal Type

`number`
