# LibroPsicotropicoCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroPsicotropicoCreateInput.schema.json](../schema-json/LibroPsicotropicoCreateInput.schema.json "open original schema") |

## LibroPsicotropicoCreateInput Type

`object` ([LibroPsicotropicoCreateInput](libropsicotropicocreateinput.md))

# LibroPsicotropicoCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                     |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-articuloid.md "undefined#/properties/articuloId")       |
| [cantidad](#cantidad)           | `number`  | Required | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-cantidad.md "undefined#/properties/cantidad")           |
| [loteId](#loteid)               | `integer` | Optional | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-loteid.md "undefined#/properties/loteId")               |
| [observaciones](#observaciones) | `string`  | Optional | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-observaciones.md "undefined#/properties/observaciones") |
| [recetaId](#recetaid)           | `integer` | Optional | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-recetaid.md "undefined#/properties/recetaId")           |
| [referencia](#referencia)       | `string`  | Optional | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-referencia.md "undefined#/properties/referencia")       |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [LibroPsicotropicoCreateInput](libropsicotropicotipo.md "undefined#/properties/tipo")                                          |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad

Non-zero; must be positive for `ingreso` and `egreso`.

`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## loteId



`loteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-loteid.md "undefined#/properties/loteId")

### loteId Type

`integer`

### loteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `300`

## recetaId



`recetaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-recetaid.md "undefined#/properties/recetaId")

### recetaId Type

`integer`

### recetaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicocreateinput-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

### referencia Constraints

**maximum length**: the maximum number of characters for this string is: `60`

## tipo



`tipo`

* is required

* Type: `string` ([LibroPsicotropicoTipo](libropsicotropicotipo.md))

* cannot be null

* defined in: [LibroPsicotropicoCreateInput](libropsicotropicotipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([LibroPsicotropicoTipo](libropsicotropicotipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"ingreso"` |             |
| `"egreso"`  |             |
| `"ajuste"`  |             |
