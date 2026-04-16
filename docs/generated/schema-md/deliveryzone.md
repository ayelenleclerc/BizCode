# DeliveryZone Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DeliveryZoneListEnvelope.schema.json\*](../schema-json/DeliveryZoneListEnvelope.schema.json "open original schema") |

## items Type

`object` ([DeliveryZone](deliveryzone.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-activo.md "undefined#/properties/activo")           |
| [createdAt](#createdat)     | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-createdat.md "undefined#/properties/createdAt")     |
| [diasEntrega](#diasentrega) | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-diasentrega.md "undefined#/properties/diasEntrega") |
| [horario](#horario)         | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-horario.md "undefined#/properties/horario")         |
| [id](#id)                   | `integer` | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-id.md "undefined#/properties/id")                   |
| [nombre](#nombre)           | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-nombre.md "undefined#/properties/nombre")           |
| [tenantId](#tenantid)       | `integer` | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-tenantid.md "undefined#/properties/tenantId")       |
| [tipo](#tipo)               | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-tipo.md "undefined#/properties/tipo")               |
| [updatedAt](#updatedat)     | `string`  | Optional | cannot be null | [DeliveryZone](deliveryzone-properties-updatedat.md "undefined#/properties/updatedAt")     |
| Additional Properties       | Any       | Optional | can be null    |                                                                                            |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

### activo Default Value

The default value is:

```json
true
```

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## diasEntrega

Comma-separated delivery day numbers, e.g. "1,3,5"

`diasEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-diasentrega.md "undefined#/properties/diasEntrega")

### diasEntrega Type

`string`

## horario

Preferred time window, e.g. "08:00-12:00"

`horario`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-horario.md "undefined#/properties/horario")

### horario Type

`string`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"barrio"`      |             |
| `"manual"`      |             |
| `"predefinida"` |             |

### tipo Default Value

The default value is:

```json
"barrio"
```

## updatedAt



`updatedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZone](deliveryzone-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
