# Articulo Schema

```txt
undefined#/properties/articulo
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaItem.schema.json\*](../schema-json/FacturaItem.schema.json "open original schema") |

## articulo Type

`object` ([Articulo](articulo.md))

# articulo Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [activo](#activo)                             | `boolean` | Optional | cannot be null | [Articulo](articulo-properties-activo.md "undefined#/properties/activo")                             |
| [codigo](#codigo)                             | `integer` | Optional | cannot be null | [Articulo](articulo-properties-codigo.md "undefined#/properties/codigo")                             |
| [codigoBarras](#codigobarras)                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-codigobarras.md "undefined#/properties/codigoBarras")                 |
| [condIva](#condiva)                           | `string`  | Optional | cannot be null | [Articulo](articulo-properties-condiva.md "undefined#/properties/condIva")                           |
| [controlLote](#controllote)                   | `boolean` | Optional | cannot be null | [Articulo](articulo-properties-controllote.md "undefined#/properties/controlLote")                   |
| [costo](#costo)                               | `number`  | Optional | cannot be null | [Articulo](articulo-properties-costo.md "undefined#/properties/costo")                               |
| [descripcion](#descripcion)                   | `string`  | Optional | cannot be null | [Articulo](articulo-properties-descripcion.md "undefined#/properties/descripcion")                   |
| [factorConversion](#factorconversion)         | `number`  | Optional | cannot be null | [Articulo](articulo-properties-factorconversion.md "undefined#/properties/factorConversion")         |
| [id](#id)                                     | `integer` | Optional | cannot be null | [Articulo](articulo-properties-id.md "undefined#/properties/id")                                     |
| [mesesGarantia](#mesesgarantia)               | `integer` | Optional | cannot be null | [Articulo](articulo-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")               |
| [minimo](#minimo)                             | `number`  | Optional | cannot be null | [Articulo](articulo-properties-minimo.md "undefined#/properties/minimo")                             |
| [monedaPrecio](#monedaprecio)                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-monedaprecio.md "undefined#/properties/monedaPrecio")                 |
| [multiploVenta](#multiploventa)               | `number`  | Optional | cannot be null | [Articulo](articulo-properties-multiploventa.md "undefined#/properties/multiploVenta")               |
| [pesoKg](#pesokg)                             | `number`  | Optional | cannot be null | [Articulo](articulo-properties-pesokg.md "undefined#/properties/pesoKg")                             |
| [precioEnMonedaOrigen](#precioenmonedaorigen) | `number`  | Optional | cannot be null | [Articulo](articulo-properties-precioenmonedaorigen.md "undefined#/properties/precioEnMonedaOrigen") |
| [precioLista1](#preciolista1)                 | `number`  | Optional | cannot be null | [Articulo](articulo-properties-preciolista1.md "undefined#/properties/precioLista1")                 |
| [precioLista2](#preciolista2)                 | `number`  | Optional | cannot be null | [Articulo](articulo-properties-preciolista2.md "undefined#/properties/precioLista2")                 |
| [rubro](#rubro)                               | `object`  | Optional | cannot be null | [Articulo](rubro.md "undefined#/properties/rubro")                                                   |
| [rubroId](#rubroid)                           | `integer` | Optional | cannot be null | [Articulo](articulo-properties-rubroid.md "undefined#/properties/rubroId")                           |
| [stock](#stock)                               | `number`  | Optional | cannot be null | [Articulo](articulo-properties-stock.md "undefined#/properties/stock")                               |
| [tipo](#tipo)                                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-tipo.md "undefined#/properties/tipo")                                 |
| [umedida](#umedida)                           | `string`  | Optional | cannot be null | [Articulo](articulo-properties-umedida.md "undefined#/properties/umedida")                           |
| [unidadBase](#unidadbase)                     | `string`  | Optional | cannot be null | [Articulo](articulo-properties-unidadbase.md "undefined#/properties/unidadBase")                     |
| [unidadCompra](#unidadcompra)                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-unidadcompra.md "undefined#/properties/unidadCompra")                 |
| [unidadServicio](#unidadservicio)             | `string`  | Optional | cannot be null | [Articulo](articulo-properties-unidadservicio.md "undefined#/properties/unidadServicio")             |
| [urlThumb](#urlthumb)                         | `string`  | Optional | cannot be null | [Articulo](articulo-properties-urlthumb.md "undefined#/properties/urlThumb")                         |
| [volumenM3](#volumenm3)                       | `number`  | Optional | cannot be null | [Articulo](articulo-properties-volumenm3.md "undefined#/properties/volumenM3")                       |
| Additional Properties                         | Any       | Optional | can be null    |                                                                                                      |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Articulo](articulo-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## codigoBarras

Optional retail/logistics barcode for seller scan (#255).

`codigoBarras`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-codigobarras.md "undefined#/properties/codigoBarras")

### codigoBarras Type

`string`

### codigoBarras Constraints

**maximum length**: the maximum number of characters for this string is: `32`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

## controlLote

When true, stock movements require lot tracking / FEFO (#202).

`controlLote`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Articulo](articulo-properties-controllote.md "undefined#/properties/controlLote")

### controlLote Type

`boolean`

## costo



`costo`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-costo.md "undefined#/properties/costo")

### costo Type

`number`

## descripcion



`descripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## factorConversion

1 purchase unit equals factorConversion base units (#203). Default 1.

`factorConversion`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-factorconversion.md "undefined#/properties/factorConversion")

### factorConversion Type

`number`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## mesesGarantia

Warranty months for physical articles; null = no warranty (#251).

`mesesGarantia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")

### mesesGarantia Type

`integer`

### mesesGarantia Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## minimo

Minimum stock in base units; Decimal(14,4) (#203).

`minimo`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-minimo.md "undefined#/properties/minimo")

### minimo Type

`number`

## monedaPrecio



`monedaPrecio`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-monedaprecio.md "undefined#/properties/monedaPrecio")

### monedaPrecio Type

`string`

### monedaPrecio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"ARS"` |             |
| `"USD"` |             |
| `"EUR"` |             |

### monedaPrecio Default Value

The default value is:

```json
"ARS"
```

## multiploVenta

Optional sale multiple for cut-to-size items (#203).

`multiploVenta`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-multiploventa.md "undefined#/properties/multiploVenta")

### multiploVenta Type

`number`

## pesoKg

Unit weight in kg for logistics (#203).

`pesoKg`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-pesokg.md "undefined#/properties/pesoKg")

### pesoKg Type

`number`

## precioEnMonedaOrigen



`precioEnMonedaOrigen`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-precioenmonedaorigen.md "undefined#/properties/precioEnMonedaOrigen")

### precioEnMonedaOrigen Type

`number`

## precioLista1



`precioLista1`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-preciolista1.md "undefined#/properties/precioLista1")

### precioLista1 Type

`number`

## precioLista2



`precioLista2`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-preciolista2.md "undefined#/properties/precioLista2")

### precioLista2 Type

`number`

## rubro



`rubro`

* is optional

* Type: `object` ([Rubro](rubro.md))

* cannot be null

* defined in: [Articulo](rubro.md "undefined#/properties/rubro")

### rubro Type

`object` ([Rubro](rubro.md))

## rubroId



`rubroId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-rubroid.md "undefined#/properties/rubroId")

### rubroId Type

`integer`

## stock

Stock quantity in base units; Decimal(14,4) (#203).

`stock`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`

## tipo

Catalog item kind (#244). Default articulo.

`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"articulo"` |             |
| `"servicio"` |             |

## umedida



`umedida`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-umedida.md "undefined#/properties/umedida")

### umedida Type

`string`

## unidadBase

Base stock/sale unit catalog (#203). Default unidad.

`unidadBase`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-unidadbase.md "undefined#/properties/unidadBase")

### unidadBase Type

`string`

### unidadBase Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"unidad"` |             |
| `"kg"`     |             |
| `"gramo"`  |             |
| `"litro"`  |             |
| `"metro"`  |             |
| `"m2"`     |             |
| `"m3"`     |             |
| `"rollo"`  |             |
| `"caja"`   |             |

## unidadCompra

Purchase unit when different from base (#203).

`unidadCompra`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-unidadcompra.md "undefined#/properties/unidadCompra")

### unidadCompra Type

`string`

## unidadServicio

Required when tipo is servicio (#244).

`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-unidadservicio.md "undefined#/properties/unidadServicio")

### unidadServicio Type

`string`

### unidadServicio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"hora"`     |             |
| `"dia"`      |             |
| `"mes"`      |             |
| `"proyecto"` |             |
| `"km"`       |             |
| `"unidad"`   |             |
| `"otro"`     |             |

## urlThumb

Principal thumbnail public path (`/uploads/articulos/...`) for seller catalog grid (#257). Null when the article has no image.

`urlThumb`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-urlthumb.md "undefined#/properties/urlThumb")

### urlThumb Type

`string`

## volumenM3

Unit volume in m3 for logistics (#203).

`volumenM3`

* is optional

* Type: `number`

* cannot be null

* defined in: [Articulo](articulo-properties-volumenm3.md "undefined#/properties/volumenM3")

### volumenM3 Type

`number`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
