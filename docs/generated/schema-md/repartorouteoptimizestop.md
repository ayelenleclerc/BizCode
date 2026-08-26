# RepartoRouteOptimizeStop Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoRouteOptimizeStop.schema.json](../schema-json/RepartoRouteOptimizeStop.schema.json "open original schema") |

## RepartoRouteOptimizeStop Type

`object` ([RepartoRouteOptimizeStop](repartorouteoptimizestop.md))

# RepartoRouteOptimizeStop Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                               |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [clienteRsocial](#clientersocial) | `string`  | Optional | cannot be null | [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-clientersocial.md "undefined#/properties/clienteRsocial") |
| [latitud](#latitud)               | `number`  | Required | cannot be null | [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-latitud.md "undefined#/properties/latitud")               |
| [longitud](#longitud)             | `number`  | Required | cannot be null | [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-longitud.md "undefined#/properties/longitud")             |
| [repartoItemId](#repartoitemid)   | `integer` | Required | cannot be null | [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-repartoitemid.md "undefined#/properties/repartoItemId")   |
| [secuencia](#secuencia)           | `integer` | Required | cannot be null | [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-secuencia.md "undefined#/properties/secuencia")           |

## clienteRsocial



`clienteRsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-clientersocial.md "undefined#/properties/clienteRsocial")

### clienteRsocial Type

`string`

## latitud



`latitud`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-latitud.md "undefined#/properties/latitud")

### latitud Type

`number`

## longitud



`longitud`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-longitud.md "undefined#/properties/longitud")

### longitud Type

`number`

## repartoItemId



`repartoItemId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-repartoitemid.md "undefined#/properties/repartoItemId")

### repartoItemId Type

`integer`

## secuencia



`secuencia`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoRouteOptimizeStop](repartorouteoptimizestop-properties-secuencia.md "undefined#/properties/secuencia")

### secuencia Type

`integer`

### secuencia Constraints

**minimum**: the value of this number must greater than or equal to: `1`
