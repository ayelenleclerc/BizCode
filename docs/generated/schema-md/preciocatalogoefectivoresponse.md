# PrecioCatalogoEfectivoResponse Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrecioCatalogoEfectivoResponse.schema.json](../schema-json/PrecioCatalogoEfectivoResponse.schema.json "open original schema") |

## PrecioCatalogoEfectivoResponse Type

`object` ([PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse.md))

# PrecioCatalogoEfectivoResponse Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-articuloid.md "undefined#/properties/articuloId") |
| [ofertaId](#ofertaid)     | `integer` | Required | cannot be null | [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-ofertaid.md "undefined#/properties/ofertaId")     |
| [origen](#origen)         | `string`  | Required | cannot be null | [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-origen.md "undefined#/properties/origen")         |
| [precio](#precio)         | `number`  | Required | cannot be null | [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-precio.md "undefined#/properties/precio")         |
| [success](#success)       | `boolean` | Required | cannot be null | [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-success.md "undefined#/properties/success")       |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## ofertaId



`ofertaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-ofertaid.md "undefined#/properties/ofertaId")

### ofertaId Type

`integer`

## origen



`origen`

* is required

* Type: `string`

* cannot be null

* defined in: [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-origen.md "undefined#/properties/origen")

### origen Type

`string`

### origen Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                 | Explanation |
| :-------------------- | :---------- |
| `"oferta"`            |             |
| `"override_variante"` |             |
| `"precio_subfamilia"` |             |
| `"precio_familia"`    |             |
| `"precio_lista1"`     |             |

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrecioCatalogoEfectivoResponse](preciocatalogoefectivoresponse-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
