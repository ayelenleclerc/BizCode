# OrdenTrabajoFacturarInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoFacturarInput.schema.json](../schema-json/OrdenTrabajoFacturarInput.schema.json "open original schema") |

## OrdenTrabajoFacturarInput Type

`object` ([OrdenTrabajoFacturarInput](ordentrabajofacturarinput.md))

# OrdenTrabajoFacturarInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-prefijo.md "undefined#/properties/prefijo")         |
| [skipArcaCae](#skiparcacae) | `boolean` | Optional | cannot be null | [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-skiparcacae.md "undefined#/properties/skipArcaCae") |
| [tipo](#tipo)               | `string`  | Optional | cannot be null | [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-tipo.md "undefined#/properties/tipo")               |

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## skipArcaCae



`skipArcaCae`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-skiparcacae.md "undefined#/properties/skipArcaCae")

### skipArcaCae Type

`boolean`

### skipArcaCae Default Value

The default value is:

```json
true
```

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoFacturarInput](ordentrabajofacturarinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
