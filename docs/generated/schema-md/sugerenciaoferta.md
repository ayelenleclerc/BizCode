# SugerenciaOferta Schema

```txt
undefined#/properties/ofertas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SugerenciasPedido.schema.json\*](../schema-json/SugerenciasPedido.schema.json "open original schema") |

## items Type

`object` ([SugerenciaOferta](sugerenciaoferta.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-articuloid.md "undefined#/properties/articuloId")       |
| [condIva](#condiva)             | `string`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-condiva.md "undefined#/properties/condIva")             |
| [descripcion](#descripcion)     | `string`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-descripcion.md "undefined#/properties/descripcion")     |
| [descuentoPct](#descuentopct)   | `number`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-descuentopct.md "undefined#/properties/descuentoPct")   |
| [precioLista](#preciolista)     | `number`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-preciolista.md "undefined#/properties/precioLista")     |
| [precioOferta](#preciooferta)   | `number`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-preciooferta.md "undefined#/properties/precioOferta")   |
| [stock](#stock)                 | `number`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-stock.md "undefined#/properties/stock")                 |
| [vigenciaHasta](#vigenciahasta) | `string`  | Required | cannot be null | [SugerenciaOferta](sugerenciaoferta-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## descuentoPct



`descuentoPct`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-descuentopct.md "undefined#/properties/descuentoPct")

### descuentoPct Type

`number`

## precioLista



`precioLista`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-preciolista.md "undefined#/properties/precioLista")

### precioLista Type

`number`

## precioOferta



`precioOferta`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-preciooferta.md "undefined#/properties/precioOferta")

### precioOferta Type

`number`

## stock



`stock`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`

## vigenciaHasta



`vigenciaHasta`

* is required

* Type: `string`

* cannot be null

* defined in: [SugerenciaOferta](sugerenciaoferta-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")

### vigenciaHasta Type

`string`

### vigenciaHasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
