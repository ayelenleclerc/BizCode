# ReplenishmentForecast Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReplenishmentForecastListEnvelope.schema.json\*](../schema-json/ReplenishmentForecastListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ReplenishmentForecast](replenishmentforecast.md))

# items Properties

| Property                                  | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :---------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)                 | `integer` | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-articuloid.md "undefined#/properties/articuloId")                 |
| [codigo](#codigo)                         | `integer` | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-codigo.md "undefined#/properties/codigo")                         |
| [costoUnitario](#costounitario)           | `number`  | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-costounitario.md "undefined#/properties/costoUnitario")           |
| [daysRemaining](#daysremaining)           | `integer` | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-daysremaining.md "undefined#/properties/daysRemaining")           |
| [descripcion](#descripcion)               | `string`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-descripcion.md "undefined#/properties/descripcion")               |
| [leadTimeDays](#leadtimedays)             | `integer` | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-leadtimedays.md "undefined#/properties/leadTimeDays")             |
| [minimo](#minimo)                         | `number`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-minimo.md "undefined#/properties/minimo")                         |
| [needsReplenishment](#needsreplenishment) | `boolean` | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-needsreplenishment.md "undefined#/properties/needsReplenishment") |
| [proveedorId](#proveedorid)               | `integer` | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-proveedorid.md "undefined#/properties/proveedorId")               |
| [status](#status)                         | `string`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-status.md "undefined#/properties/status")                         |
| [stock](#stock)                           | `number`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-stock.md "undefined#/properties/stock")                           |
| [suggestedOrderQty](#suggestedorderqty)   | `integer` | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-suggestedorderqty.md "undefined#/properties/suggestedOrderQty")   |
| [tipo](#tipo)                             | `string`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-tipo.md "undefined#/properties/tipo")                             |
| [unitsSoldInWindow](#unitssoldinwindow)   | `number`  | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-unitssoldinwindow.md "undefined#/properties/unitsSoldInWindow")   |
| [velocityPerDay](#velocityperday)         | `number`  | Optional | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-velocityperday.md "undefined#/properties/velocityPerDay")         |
| [windowDays](#windowdays)                 | `integer` | Required | cannot be null | [ReplenishmentForecast](replenishmentforecast-properties-windowdays.md "undefined#/properties/windowDays")                 |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## costoUnitario



`costoUnitario`

* is optional

* Type: `number`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-costounitario.md "undefined#/properties/costoUnitario")

### costoUnitario Type

`number`

## daysRemaining



`daysRemaining`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-daysremaining.md "undefined#/properties/daysRemaining")

### daysRemaining Type

`integer`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## leadTimeDays



`leadTimeDays`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-leadtimedays.md "undefined#/properties/leadTimeDays")

### leadTimeDays Type

`integer`

## minimo



`minimo`

* is required

* Type: `number`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-minimo.md "undefined#/properties/minimo")

### minimo Type

`number`

## needsReplenishment



`needsReplenishment`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-needsreplenishment.md "undefined#/properties/needsReplenishment")

### needsReplenishment Type

`boolean`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-status.md "undefined#/properties/status")

### status Type

`string`

### status Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                 | Explanation |
| :-------------------- | :---------- |
| `"ok"`                |             |
| `"insufficient_data"` |             |

## stock



`stock`

* is required

* Type: `number`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`

## suggestedOrderQty



`suggestedOrderQty`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-suggestedorderqty.md "undefined#/properties/suggestedOrderQty")

### suggestedOrderQty Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

## unitsSoldInWindow



`unitsSoldInWindow`

* is required

* Type: `number`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-unitssoldinwindow.md "undefined#/properties/unitsSoldInWindow")

### unitsSoldInWindow Type

`number`

## velocityPerDay



`velocityPerDay`

* is optional

* Type: `number`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-velocityperday.md "undefined#/properties/velocityPerDay")

### velocityPerDay Type

`number`

## windowDays



`windowDays`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReplenishmentForecast](replenishmentforecast-properties-windowdays.md "undefined#/properties/windowDays")

### windowDays Type

`integer`

### windowDays Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `30`  |             |
| `60`  |             |
| `90`  |             |
