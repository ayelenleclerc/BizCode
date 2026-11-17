# PresentacionOSCobroInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSCobroInput.schema.json](../schema-json/PresentacionOSCobroInput.schema.json "open original schema") |

## PresentacionOSCobroInput Type

`object` ([PresentacionOSCobroInput](presentacionoscobroinput.md))

# PresentacionOSCobroInput Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                                               |
| :-------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [fechaPago](#fechapago)           | `string` | Optional | cannot be null | [PresentacionOSCobroInput](presentacionoscobroinput-properties-fechapago.md "undefined#/properties/fechaPago")           |
| [importeCobrado](#importecobrado) | `number` | Required | cannot be null | [PresentacionOSCobroInput](presentacionoscobroinput-properties-importecobrado.md "undefined#/properties/importeCobrado") |

## fechaPago



`fechaPago`

* is optional

* Type: `string`

* cannot be null

* defined in: [PresentacionOSCobroInput](presentacionoscobroinput-properties-fechapago.md "undefined#/properties/fechaPago")

### fechaPago Type

`string`

## importeCobrado



`importeCobrado`

* is required

* Type: `number`

* cannot be null

* defined in: [PresentacionOSCobroInput](presentacionoscobroinput-properties-importecobrado.md "undefined#/properties/importeCobrado")

### importeCobrado Type

`number`

### importeCobrado Constraints

**minimum**: the value of this number must greater than or equal to: `0`
