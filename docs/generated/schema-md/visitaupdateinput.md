# VisitaUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaUpdateInput.schema.json](../schema-json/VisitaUpdateInput.schema.json "open original schema") |

## VisitaUpdateInput Type

`object` ([VisitaUpdateInput](visitaupdateinput.md))

# VisitaUpdateInput Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :---------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [duracionMinutos](#duracionminutos) | `integer` | Optional | cannot be null | [VisitaUpdateInput](visitaupdateinput-properties-duracionminutos.md "undefined#/properties/duracionMinutos") |
| [estadoPlan](#estadoplan)           | `string`  | Optional | cannot be null | [VisitaUpdateInput](visitaestadoplan.md "undefined#/properties/estadoPlan")                                  |
| [notasVisita](#notasvisita)         | `string`  | Optional | cannot be null | [VisitaUpdateInput](visitaupdateinput-properties-notasvisita.md "undefined#/properties/notasVisita")         |
| [orden](#orden)                     | `integer` | Optional | cannot be null | [VisitaUpdateInput](visitaupdateinput-properties-orden.md "undefined#/properties/orden")                     |
| [pedidoId](#pedidoid)               | `integer` | Optional | cannot be null | [VisitaUpdateInput](visitaupdateinput-properties-pedidoid.md "undefined#/properties/pedidoId")               |
| [resultado](#resultado)             | `string`  | Optional | cannot be null | [VisitaUpdateInput](visitaupdateinput-properties-resultado.md "undefined#/properties/resultado")             |

## duracionMinutos



`duracionMinutos`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VisitaUpdateInput](visitaupdateinput-properties-duracionminutos.md "undefined#/properties/duracionMinutos")

### duracionMinutos Type

`integer`

### duracionMinutos Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## estadoPlan



`estadoPlan`

* is optional

* Type: `string` ([VisitaEstadoPlan](visitaestadoplan.md))

* cannot be null

* defined in: [VisitaUpdateInput](visitaestadoplan.md "undefined#/properties/estadoPlan")

### estadoPlan Type

`string` ([VisitaEstadoPlan](visitaestadoplan.md))

### estadoPlan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"completada"`  |             |
| `"no_visitada"` |             |

## notasVisita



`notasVisita`

* is optional

* Type: `string`

* cannot be null

* defined in: [VisitaUpdateInput](visitaupdateinput-properties-notasvisita.md "undefined#/properties/notasVisita")

### notasVisita Type

`string`

### notasVisita Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## orden



`orden`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VisitaUpdateInput](visitaupdateinput-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

### orden Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VisitaUpdateInput](visitaupdateinput-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

### pedidoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## resultado



`resultado`

* is optional

* Type: `string`

* cannot be null

* defined in: [VisitaUpdateInput](visitaupdateinput-properties-resultado.md "undefined#/properties/resultado")

### resultado Type

`string`

### resultado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"venta"`           |             |
| `"sin_pedido"`      |             |
| `"cliente_ausente"` |             |
| `"otro"`            |             |
| `null`              |             |
