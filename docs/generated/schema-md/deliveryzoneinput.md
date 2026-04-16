# DeliveryZoneInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DeliveryZoneInput.schema.json](../schema-json/DeliveryZoneInput.schema.json "open original schema") |

## DeliveryZoneInput Type

`object` ([DeliveryZoneInput](deliveryzoneinput.md))

# DeliveryZoneInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                           |
| :-------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [diasEntrega](#diasentrega) | `string` | Optional | cannot be null | [DeliveryZoneInput](deliveryzoneinput-properties-diasentrega.md "undefined#/properties/diasEntrega") |
| [horario](#horario)         | `string` | Optional | cannot be null | [DeliveryZoneInput](deliveryzoneinput-properties-horario.md "undefined#/properties/horario")         |
| [nombre](#nombre)           | `string` | Required | cannot be null | [DeliveryZoneInput](deliveryzoneinput-properties-nombre.md "undefined#/properties/nombre")           |
| [tipo](#tipo)               | `string` | Optional | cannot be null | [DeliveryZoneInput](deliveryzoneinput-properties-tipo.md "undefined#/properties/tipo")               |

## diasEntrega



`diasEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneInput](deliveryzoneinput-properties-diasentrega.md "undefined#/properties/diasEntrega")

### diasEntrega Type

`string`

### diasEntrega Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## horario



`horario`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneInput](deliveryzoneinput-properties-horario.md "undefined#/properties/horario")

### horario Type

`string`

### horario Constraints

**maximum length**: the maximum number of characters for this string is: `30`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneInput](deliveryzoneinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `60`

**minimum length**: the minimum number of characters for this string is: `1`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneInput](deliveryzoneinput-properties-tipo.md "undefined#/properties/tipo")

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
