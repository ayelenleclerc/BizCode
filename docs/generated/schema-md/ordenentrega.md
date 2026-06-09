# OrdenEntrega Schema

```txt
undefined#/properties/ordenEntrega
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoItemLine.schema.json\*](../schema-json/RepartoItemLine.schema.json "open original schema") |

## ordenEntrega Type

`object` ([OrdenEntrega](ordenentrega.md))

# ordenEntrega Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [cliente](#cliente)                                 | `object`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-cliente.md "undefined#/properties/cliente")                                 |
| [clienteId](#clienteid)                             | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-clienteid.md "undefined#/properties/clienteId")                             |
| [dispatchTimestampSource](#dispatchtimestampsource) | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-dispatchtimestampsource.md "undefined#/properties/dispatchTimestampSource") |
| [dispatchedAt](#dispatchedat)                       | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-dispatchedat.md "undefined#/properties/dispatchedAt")                       |
| [driver](#driver)                                   | `object`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-driver.md "undefined#/properties/driver")                                   |
| [driverId](#driverid)                               | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-driverid.md "undefined#/properties/driverId")                               |
| [estado](#estado)                                   | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-estado.md "undefined#/properties/estado")                                   |
| [factura](#factura)                                 | `object`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-factura.md "undefined#/properties/factura")                                 |
| [facturaId](#facturaid)                             | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-facturaid.md "undefined#/properties/facturaId")                             |
| [fecha](#fecha)                                     | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-fecha.md "undefined#/properties/fecha")                                     |
| [id](#id)                                           | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-id.md "undefined#/properties/id")                                           |
| [items](#items)                                     | `array`   | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-items.md "undefined#/properties/items")                                     |
| [nota](#nota)                                       | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-nota.md "undefined#/properties/nota")                                       |
| [picker](#picker)                                   | `object`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-picker.md "undefined#/properties/picker")                                   |
| [pickerUserId](#pickeruserid)                       | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-pickeruserid.md "undefined#/properties/pickerUserId")                       |
| [pickingIniciadoAt](#pickinginiciadoat)             | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-pickinginiciadoat.md "undefined#/properties/pickingIniciadoAt")             |
| [pickingListoAt](#pickinglistoat)                   | `string`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-pickinglistoat.md "undefined#/properties/pickingListoAt")                   |
| [tenantId](#tenantid)                               | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-tenantid.md "undefined#/properties/tenantId")                               |
| [zona](#zona)                                       | `object`  | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-zona.md "undefined#/properties/zona")                                       |
| [zonaId](#zonaid)                                   | `integer` | Optional | cannot be null | [OrdenEntrega](ordenentrega-properties-zonaid.md "undefined#/properties/zonaId")                                   |
| Additional Properties                               | Any       | Optional | can be null    |                                                                                                                    |

## cliente



`cliente`

* is optional

* Type: `object` ([Details](ordenentrega-properties-cliente.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-cliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([Details](ordenentrega-properties-cliente.md))

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## dispatchTimestampSource

How dispatchedAt was derived (audit event vs estimated from updatedAt).

`dispatchTimestampSource`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-dispatchtimestampsource.md "undefined#/properties/dispatchTimestampSource")

### dispatchTimestampSource Type

`string`

### dispatchTimestampSource Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"event"`     |             |
| `"estimated"` |             |

## dispatchedAt

When the order entered in\_transit (ADR-0011).

`dispatchedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-dispatchedat.md "undefined#/properties/dispatchedAt")

### dispatchedAt Type

`string`

### dispatchedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## driver



`driver`

* is optional

* Type: `object` ([Details](ordenentrega-properties-driver.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-driver.md "undefined#/properties/driver")

### driver Type

`object` ([Details](ordenentrega-properties-driver.md))

## driverId



`driverId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-driverid.md "undefined#/properties/driverId")

### driverId Type

`integer`

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"picking"`    |             |
| `"ready"`      |             |
| `"assigned"`   |             |
| `"in_transit"` |             |
| `"delivered"`  |             |
| `"failed"`     |             |
| `"cancelled"`  |             |

## factura



`factura`

* is optional

* Type: `object` ([Details](ordenentrega-properties-factura.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-factura.md "undefined#/properties/factura")

### factura Type

`object` ([Details](ordenentrega-properties-factura.md))

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([OrdenEntregaLineItem](ordenentregalineitem.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenEntregaLineItem](ordenentregalineitem.md))

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

## picker



`picker`

* is optional

* Type: `object` ([Details](ordenentrega-properties-picker.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-picker.md "undefined#/properties/picker")

### picker Type

`object` ([Details](ordenentrega-properties-picker.md))

## pickerUserId



`pickerUserId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-pickeruserid.md "undefined#/properties/pickerUserId")

### pickerUserId Type

`integer`

## pickingIniciadoAt



`pickingIniciadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-pickinginiciadoat.md "undefined#/properties/pickingIniciadoAt")

### pickingIniciadoAt Type

`string`

### pickingIniciadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## pickingListoAt



`pickingListoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-pickinglistoat.md "undefined#/properties/pickingListoAt")

### pickingListoAt Type

`string`

### pickingListoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## zona



`zona`

* is optional

* Type: `object` ([Details](ordenentrega-properties-zona.md))

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-zona.md "undefined#/properties/zona")

### zona Type

`object` ([Details](ordenentrega-properties-zona.md))

## zonaId



`zonaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntrega](ordenentrega-properties-zonaid.md "undefined#/properties/zonaId")

### zonaId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
