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
| [condIva](#condiva)                           | `string`  | Optional | cannot be null | [Articulo](articulo-properties-condiva.md "undefined#/properties/condIva")                           |
| [costo](#costo)                               | `number`  | Optional | cannot be null | [Articulo](articulo-properties-costo.md "undefined#/properties/costo")                               |
| [descripcion](#descripcion)                   | `string`  | Optional | cannot be null | [Articulo](articulo-properties-descripcion.md "undefined#/properties/descripcion")                   |
| [id](#id)                                     | `integer` | Optional | cannot be null | [Articulo](articulo-properties-id.md "undefined#/properties/id")                                     |
| [mesesGarantia](#mesesgarantia)               | `integer` | Optional | cannot be null | [Articulo](articulo-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")               |
| [minimo](#minimo)                             | `integer` | Optional | cannot be null | [Articulo](articulo-properties-minimo.md "undefined#/properties/minimo")                             |
| [monedaPrecio](#monedaprecio)                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-monedaprecio.md "undefined#/properties/monedaPrecio")                 |
| [precioEnMonedaOrigen](#precioenmonedaorigen) | `number`  | Optional | cannot be null | [Articulo](articulo-properties-precioenmonedaorigen.md "undefined#/properties/precioEnMonedaOrigen") |
| [precioLista1](#preciolista1)                 | `number`  | Optional | cannot be null | [Articulo](articulo-properties-preciolista1.md "undefined#/properties/precioLista1")                 |
| [precioLista2](#preciolista2)                 | `number`  | Optional | cannot be null | [Articulo](articulo-properties-preciolista2.md "undefined#/properties/precioLista2")                 |
| [rubro](#rubro)                               | `object`  | Optional | cannot be null | [Articulo](rubro.md "undefined#/properties/rubro")                                                   |
| [rubroId](#rubroid)                           | `integer` | Optional | cannot be null | [Articulo](articulo-properties-rubroid.md "undefined#/properties/rubroId")                           |
| [stock](#stock)                               | `integer` | Optional | cannot be null | [Articulo](articulo-properties-stock.md "undefined#/properties/stock")                               |
| [tipo](#tipo)                                 | `string`  | Optional | cannot be null | [Articulo](articulo-properties-tipo.md "undefined#/properties/tipo")                                 |
| [umedida](#umedida)                           | `string`  | Optional | cannot be null | [Articulo](articulo-properties-umedida.md "undefined#/properties/umedida")                           |
| [unidadServicio](#unidadservicio)             | `string`  | Optional | cannot be null | [Articulo](articulo-properties-unidadservicio.md "undefined#/properties/unidadServicio")             |
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

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [Articulo](articulo-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

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



`minimo`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-minimo.md "undefined#/properties/minimo")

### minimo Type

`integer`

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



`stock`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Articulo](articulo-properties-stock.md "undefined#/properties/stock")

### stock Type

`integer`

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

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
