# MisComisionesResponse Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MisComisionesResponse.schema.json](../schema-json/MisComisionesResponse.schema.json "open original schema") |

## MisComisionesResponse Type

`object` ([MisComisionesResponse](miscomisionesresponse.md))

# MisComisionesResponse Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [estimacion](#estimacion)       | `object`  | Required | cannot be null | [MisComisionesResponse](miscomisionesresponse-properties-estimacion.md "undefined#/properties/estimacion")       |
| [liquidaciones](#liquidaciones) | `array`   | Required | cannot be null | [MisComisionesResponse](miscomisionesresponse-properties-liquidaciones.md "undefined#/properties/liquidaciones") |
| [periodo](#periodo)             | `string`  | Required | cannot be null | [MisComisionesResponse](miscomisionesresponse-properties-periodo.md "undefined#/properties/periodo")             |
| [success](#success)             | `boolean` | Required | cannot be null | [MisComisionesResponse](miscomisionesresponse-properties-success.md "undefined#/properties/success")             |

## estimacion



`estimacion`

* is required

* Type: `object` ([Details](miscomisionesresponse-properties-estimacion.md))

* cannot be null

* defined in: [MisComisionesResponse](miscomisionesresponse-properties-estimacion.md "undefined#/properties/estimacion")

### estimacion Type

`object` ([Details](miscomisionesresponse-properties-estimacion.md))

## liquidaciones



`liquidaciones`

* is required

* Type: `object[]` ([LiquidacionComision](liquidacioncomision.md))

* cannot be null

* defined in: [MisComisionesResponse](miscomisionesresponse-properties-liquidaciones.md "undefined#/properties/liquidaciones")

### liquidaciones Type

`object[]` ([LiquidacionComision](liquidacioncomision.md))

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [MisComisionesResponse](miscomisionesresponse-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MisComisionesResponse](miscomisionesresponse-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
