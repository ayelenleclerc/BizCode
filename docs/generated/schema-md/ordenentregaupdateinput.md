# OrdenEntregaUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaUpdateInput.schema.json](../schema-json/OrdenEntregaUpdateInput.schema.json "open original schema") |

## OrdenEntregaUpdateInput Type

`object` ([OrdenEntregaUpdateInput](ordenentregaupdateinput.md))

# OrdenEntregaUpdateInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                                 |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [driverId](#driverid) | `integer` | Optional | cannot be null | [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-driverid.md "undefined#/properties/driverId") |
| [estado](#estado)     | `string`  | Required | cannot be null | [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-estado.md "undefined#/properties/estado")     |
| [nota](#nota)         | `string`  | Optional | cannot be null | [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-nota.md "undefined#/properties/nota")         |
| [zonaId](#zonaid)     | `integer` | Optional | cannot be null | [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-zonaid.md "undefined#/properties/zonaId")     |

## driverId



`driverId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-driverid.md "undefined#/properties/driverId")

### driverId Type

`integer`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"assigned"`   |             |
| `"in_transit"` |             |
| `"delivered"`  |             |
| `"failed"`     |             |

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## zonaId



`zonaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaUpdateInput](ordenentregaupdateinput-properties-zonaid.md "undefined#/properties/zonaId")

### zonaId Type

`integer`
