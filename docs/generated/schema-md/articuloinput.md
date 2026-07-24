# ArticuloInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloInput.schema.json](../schema-json/ArticuloInput.schema.json "open original schema") |

## ArticuloInput Type

`object` ([ArticuloInput](articuloinput.md))

# ArticuloInput Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                     |
| :-------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                             | `boolean` | Required | cannot be null | [ArticuloInput](articuloinput-properties-activo.md "undefined#/properties/activo")                             |
| [codigo](#codigo)                             | `integer` | Required | cannot be null | [ArticuloInput](articuloinput-properties-codigo.md "undefined#/properties/codigo")                             |
| [condIva](#condiva)                           | `string`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-condiva.md "undefined#/properties/condIva")                           |
| [costo](#costo)                               | `number`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-costo.md "undefined#/properties/costo")                               |
| [descripcion](#descripcion)                   | `string`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-descripcion.md "undefined#/properties/descripcion")                   |
| [mesesGarantia](#mesesgarantia)               | `integer` | Optional | cannot be null | [ArticuloInput](articuloinput-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")               |
| [minimo](#minimo)                             | `integer` | Required | cannot be null | [ArticuloInput](articuloinput-properties-minimo.md "undefined#/properties/minimo")                             |
| [monedaPrecio](#monedaprecio)                 | `string`  | Optional | cannot be null | [ArticuloInput](articuloinput-properties-monedaprecio.md "undefined#/properties/monedaPrecio")                 |
| [precioEnMonedaOrigen](#precioenmonedaorigen) | `number`  | Optional | cannot be null | [ArticuloInput](articuloinput-properties-precioenmonedaorigen.md "undefined#/properties/precioEnMonedaOrigen") |
| [precioLista1](#preciolista1)                 | `number`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-preciolista1.md "undefined#/properties/precioLista1")                 |
| [precioLista2](#preciolista2)                 | `number`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-preciolista2.md "undefined#/properties/precioLista2")                 |
| [rubroId](#rubroid)                           | `integer` | Required | cannot be null | [ArticuloInput](articuloinput-properties-rubroid.md "undefined#/properties/rubroId")                           |
| [stock](#stock)                               | `integer` | Required | cannot be null | [ArticuloInput](articuloinput-properties-stock.md "undefined#/properties/stock")                               |
| [tipo](#tipo)                                 | `string`  | Optional | cannot be null | [ArticuloInput](articuloinput-properties-tipo.md "undefined#/properties/tipo")                                 |
| [umedida](#umedida)                           | `string`  | Required | cannot be null | [ArticuloInput](articuloinput-properties-umedida.md "undefined#/properties/umedida")                           |
| [unidadServicio](#unidadservicio)             | `string`  | Optional | cannot be null | [ArticuloInput](articuloinput-properties-unidadservicio.md "undefined#/properties/unidadServicio")             |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

### codigo Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

### condIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"1"` |             |
| `"2"` |             |
| `"3"` |             |

## costo



`costo`

* is required

* Type: `number`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-costo.md "undefined#/properties/costo")

### costo Type

`number`

### costo Constraints

**minimum**: the value of this number must greater than or equal to: `0.01`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `30`

**minimum length**: the minimum number of characters for this string is: `3`

## mesesGarantia

Warranty months; ignored for servicio (#251).

`mesesGarantia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")

### mesesGarantia Type

`integer`

### mesesGarantia Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## minimo

Must be 0 when tipo is servicio (#244).

`minimo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-minimo.md "undefined#/properties/minimo")

### minimo Type

`integer`

### minimo Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## monedaPrecio

Catalog price currency; ARS materializes precioLista1 directly (#243).

`monedaPrecio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-monedaprecio.md "undefined#/properties/monedaPrecio")

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

Required when monedaPrecio is USD or EUR; drives ARS precioLista1 via current TC (#243).

`precioEnMonedaOrigen`

* is optional

* Type: `number`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-precioenmonedaorigen.md "undefined#/properties/precioEnMonedaOrigen")

### precioEnMonedaOrigen Type

`number`

### precioEnMonedaOrigen Constraints

**minimum**: the value of this number must greater than or equal to: `0.0001`

## precioLista1



`precioLista1`

* is required

* Type: `number`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-preciolista1.md "undefined#/properties/precioLista1")

### precioLista1 Type

`number`

### precioLista1 Constraints

**minimum**: the value of this number must greater than or equal to: `0.01`

## precioLista2



`precioLista2`

* is required

* Type: `number`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-preciolista2.md "undefined#/properties/precioLista2")

### precioLista2 Type

`number`

### precioLista2 Constraints

**minimum**: the value of this number must greater than or equal to: `0.01`

## rubroId



`rubroId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-rubroid.md "undefined#/properties/rubroId")

### rubroId Type

`integer`

## stock

Must be 0 when tipo is servicio (#244).

`stock`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-stock.md "undefined#/properties/stock")

### stock Type

`integer`

### stock Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"articulo"` |             |
| `"servicio"` |             |

### tipo Default Value

The default value is:

```json
"articulo"
```

## umedida



`umedida`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-umedida.md "undefined#/properties/umedida")

### umedida Type

`string`

### umedida Constraints

**maximum length**: the maximum number of characters for this string is: `6`

**minimum length**: the minimum number of characters for this string is: `2`

## unidadServicio



`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArticuloInput](articuloinput-properties-unidadservicio.md "undefined#/properties/unidadServicio")

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
