# SugerenciaHabitual Schema

```txt
undefined#/properties/habituales/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SugerenciasPedido.schema.json\*](../schema-json/SugerenciasPedido.schema.json "open original schema") |

## items Type

`object` ([SugerenciaHabitual](sugerenciahabitual.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [anomalia](#anomalia)                 | `boolean` | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-anomalia.md "undefined#/properties/anomalia")                 |
| [articuloId](#articuloid)             | `integer` | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-articuloid.md "undefined#/properties/articuloId")             |
| [cantidadSugerida](#cantidadsugerida) | `number`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-cantidadsugerida.md "undefined#/properties/cantidadSugerida") |
| [condIva](#condiva)                   | `string`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-condiva.md "undefined#/properties/condIva")                   |
| [descripcion](#descripcion)           | `string`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-descripcion.md "undefined#/properties/descripcion")           |
| [diasDesdeUltima](#diasdesdeultima)   | `integer` | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-diasdesdeultima.md "undefined#/properties/diasDesdeUltima")   |
| [frecuenciaDias](#frecuenciadias)     | `number`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-frecuenciadias.md "undefined#/properties/frecuenciaDias")     |
| [origenPrecio](#origenprecio)         | `string`  | Required | cannot be null | [SugerenciaHabitual](sugerenciaorigenprecio.md "undefined#/properties/origenPrecio")                             |
| [precio](#precio)                     | `number`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-precio.md "undefined#/properties/precio")                     |
| [stock](#stock)                       | `number`  | Required | cannot be null | [SugerenciaHabitual](sugerenciahabitual-properties-stock.md "undefined#/properties/stock")                       |

## anomalia



`anomalia`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-anomalia.md "undefined#/properties/anomalia")

### anomalia Type

`boolean`

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidadSugerida



`cantidadSugerida`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-cantidadsugerida.md "undefined#/properties/cantidadSugerida")

### cantidadSugerida Type

`number`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## diasDesdeUltima



`diasDesdeUltima`

* is required

* Type: `integer`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-diasdesdeultima.md "undefined#/properties/diasDesdeUltima")

### diasDesdeUltima Type

`integer`

### diasDesdeUltima Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## frecuenciaDias



`frecuenciaDias`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-frecuenciadias.md "undefined#/properties/frecuenciaDias")

### frecuenciaDias Type

`number`

## origenPrecio



`origenPrecio`

* is required

* Type: `string` ([SugerenciaOrigenPrecio](sugerenciaorigenprecio.md))

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciaorigenprecio.md "undefined#/properties/origenPrecio")

### origenPrecio Type

`string` ([SugerenciaOrigenPrecio](sugerenciaorigenprecio.md))

### origenPrecio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"lista"`  |             |
| `"oferta"` |             |

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## stock



`stock`

* is required

* Type: `number`

* cannot be null

* defined in: [SugerenciaHabitual](sugerenciahabitual-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`
