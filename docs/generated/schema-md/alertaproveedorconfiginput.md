# AlertaProveedorConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AlertaProveedorConfigInput.schema.json](../schema-json/AlertaProveedorConfigInput.schema.json "open original schema") |

## AlertaProveedorConfigInput Type

`object` ([AlertaProveedorConfigInput](alertaproveedorconfiginput.md))

# AlertaProveedorConfigInput Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                                     |
| :---------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [diasCritico](#diascritico)         | `integer` | Optional | cannot be null | [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-diascritico.md "undefined#/properties/diasCritico")         |
| [diasPrevioAviso](#diasprevioaviso) | `integer` | Optional | cannot be null | [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-diasprevioaviso.md "undefined#/properties/diasPrevioAviso") |
| [notifEmail](#notifemail)           | `boolean` | Optional | cannot be null | [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-notifemail.md "undefined#/properties/notifEmail")           |
| [notifInApp](#notifinapp)           | `boolean` | Optional | cannot be null | [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-notifinapp.md "undefined#/properties/notifInApp")           |

## diasCritico



`diasCritico`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-diascritico.md "undefined#/properties/diasCritico")

### diasCritico Type

`integer`

### diasCritico Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `1`

## diasPrevioAviso



`diasPrevioAviso`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-diasprevioaviso.md "undefined#/properties/diasPrevioAviso")

### diasPrevioAviso Type

`integer`

### diasPrevioAviso Constraints

**maximum**: the value of this number must smaller than or equal to: `90`

**minimum**: the value of this number must greater than or equal to: `0`

## notifEmail



`notifEmail`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-notifemail.md "undefined#/properties/notifEmail")

### notifEmail Type

`boolean`

## notifInApp



`notifInApp`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [AlertaProveedorConfigInput](alertaproveedorconfiginput-properties-notifinapp.md "undefined#/properties/notifInApp")

### notifInApp Type

`boolean`
