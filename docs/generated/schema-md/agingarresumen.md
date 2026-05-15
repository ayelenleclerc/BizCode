# AgingArResumen Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AgingArResumen.schema.json](../schema-json/AgingArResumen.schema.json "open original schema") |

## AgingArResumen Type

`object` ([AgingArResumen](agingarresumen.md))

# AgingArResumen Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [clientesSuspendidos](#clientessuspendidos) | `integer` | Required | cannot be null | [AgingArResumen](agingarresumen-properties-clientessuspendidos.md "undefined#/properties/clientesSuspendidos") |
| [deudaPorVencer](#deudaporvencer)           | `string`  | Required | cannot be null | [AgingArResumen](agingarresumen-properties-deudaporvencer.md "undefined#/properties/deudaPorVencer")           |
| [deudaVencida](#deudavencida)               | `string`  | Required | cannot be null | [AgingArResumen](agingarresumen-properties-deudavencida.md "undefined#/properties/deudaVencida")               |
| [porcentajeMora](#porcentajemora)           | `string`  | Required | cannot be null | [AgingArResumen](agingarresumen-properties-porcentajemora.md "undefined#/properties/porcentajeMora")           |

## clientesSuspendidos



`clientesSuspendidos`

* is required

* Type: `integer`

* cannot be null

* defined in: [AgingArResumen](agingarresumen-properties-clientessuspendidos.md "undefined#/properties/clientesSuspendidos")

### clientesSuspendidos Type

`integer`

### clientesSuspendidos Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## deudaPorVencer



`deudaPorVencer`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingArResumen](agingarresumen-properties-deudaporvencer.md "undefined#/properties/deudaPorVencer")

### deudaPorVencer Type

`string`

## deudaVencida



`deudaVencida`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingArResumen](agingarresumen-properties-deudavencida.md "undefined#/properties/deudaVencida")

### deudaVencida Type

`string`

## porcentajeMora



`porcentajeMora`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingArResumen](agingarresumen-properties-porcentajemora.md "undefined#/properties/porcentajeMora")

### porcentajeMora Type

`string`
