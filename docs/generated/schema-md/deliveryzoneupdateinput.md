# DeliveryZoneUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DeliveryZoneUpdateInput.schema.json](../schema-json/DeliveryZoneUpdateInput.schema.json "open original schema") |

## DeliveryZoneUpdateInput Type

`object` ([DeliveryZoneUpdateInput](deliveryzoneupdateinput.md))

# DeliveryZoneUpdateInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                       |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Optional | cannot be null | [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-activo.md "undefined#/properties/activo")           |
| [diasEntrega](#diasentrega) | `string`  | Optional | cannot be null | [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-diasentrega.md "undefined#/properties/diasEntrega") |
| [horario](#horario)         | `string`  | Optional | cannot be null | [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-horario.md "undefined#/properties/horario")         |
| [nombre](#nombre)           | `string`  | Optional | cannot be null | [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-nombre.md "undefined#/properties/nombre")           |
| [tipo](#tipo)               | `string`  | Optional | cannot be null | [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-tipo.md "undefined#/properties/tipo")               |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## diasEntrega



`diasEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-diasentrega.md "undefined#/properties/diasEntrega")

### diasEntrega Type

`string`

### diasEntrega Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## horario



`horario`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-horario.md "undefined#/properties/horario")

### horario Type

`string`

### horario Constraints

**maximum length**: the maximum number of characters for this string is: `30`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-nombre.md "undefined#/properties/nombre")

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

* defined in: [DeliveryZoneUpdateInput](deliveryzoneupdateinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"barrio"`      |             |
| `"manual"`      |             |
| `"predefinida"` |             |
