# TurnoCajaOpenInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TurnoCajaOpenInput.schema.json](../schema-json/TurnoCajaOpenInput.schema.json "open original schema") |

## TurnoCajaOpenInput Type

`object` ([TurnoCajaOpenInput](turnocajaopeninput.md))

# TurnoCajaOpenInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [cajaId](#cajaid)               | `integer` | Required | cannot be null | [TurnoCajaOpenInput](turnocajaopeninput-properties-cajaid.md "undefined#/properties/cajaId")               |
| [montoApertura](#montoapertura) | `number`  | Required | cannot be null | [TurnoCajaOpenInput](turnocajaopeninput-properties-montoapertura.md "undefined#/properties/montoApertura") |

## cajaId



`cajaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TurnoCajaOpenInput](turnocajaopeninput-properties-cajaid.md "undefined#/properties/cajaId")

### cajaId Type

`integer`

### cajaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## montoApertura



`montoApertura`

* is required

* Type: `number`

* cannot be null

* defined in: [TurnoCajaOpenInput](turnocajaopeninput-properties-montoapertura.md "undefined#/properties/montoApertura")

### montoApertura Type

`number`

### montoApertura Constraints

**minimum**: the value of this number must greater than or equal to: `0`
