# RepartoUbicacionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoUbicacionInput.schema.json](../schema-json/RepartoUbicacionInput.schema.json "open original schema") |

## RepartoUbicacionInput Type

`object` ([RepartoUbicacionInput](repartoubicacioninput.md))

# RepartoUbicacionInput Properties

| Property    | Type     | Required | Nullable       | Defined by                                                                                   |
| :---------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [lat](#lat) | `number` | Required | cannot be null | [RepartoUbicacionInput](repartoubicacioninput-properties-lat.md "undefined#/properties/lat") |
| [lng](#lng) | `number` | Required | cannot be null | [RepartoUbicacionInput](repartoubicacioninput-properties-lng.md "undefined#/properties/lng") |

## lat



`lat`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoUbicacionInput](repartoubicacioninput-properties-lat.md "undefined#/properties/lat")

### lat Type

`number`

### lat Constraints

**maximum**: the value of this number must smaller than or equal to: `90`

**minimum**: the value of this number must greater than or equal to: `-90`

## lng



`lng`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoUbicacionInput](repartoubicacioninput-properties-lng.md "undefined#/properties/lng")

### lng Type

`number`

### lng Constraints

**maximum**: the value of this number must smaller than or equal to: `180`

**minimum**: the value of this number must greater than or equal to: `-180`
