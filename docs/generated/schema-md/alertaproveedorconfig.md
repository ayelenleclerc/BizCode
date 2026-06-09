# AlertaProveedorConfig Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AlertaProveedorConfigEnvelope.schema.json\*](../schema-json/AlertaProveedorConfigEnvelope.schema.json "open original schema") |

## data Type

`object` ([AlertaProveedorConfig](alertaproveedorconfig.md))

# data Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [diasCritico](#diascritico)         | `integer` | Required | cannot be null | [AlertaProveedorConfig](alertaproveedorconfig-properties-diascritico.md "undefined#/properties/diasCritico")         |
| [diasPrevioAviso](#diasprevioaviso) | `integer` | Required | cannot be null | [AlertaProveedorConfig](alertaproveedorconfig-properties-diasprevioaviso.md "undefined#/properties/diasPrevioAviso") |
| [notifEmail](#notifemail)           | `boolean` | Required | cannot be null | [AlertaProveedorConfig](alertaproveedorconfig-properties-notifemail.md "undefined#/properties/notifEmail")           |
| [notifInApp](#notifinapp)           | `boolean` | Required | cannot be null | [AlertaProveedorConfig](alertaproveedorconfig-properties-notifinapp.md "undefined#/properties/notifInApp")           |

## diasCritico



`diasCritico`

* is required

* Type: `integer`

* cannot be null

* defined in: [AlertaProveedorConfig](alertaproveedorconfig-properties-diascritico.md "undefined#/properties/diasCritico")

### diasCritico Type

`integer`

### diasCritico Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `1`

## diasPrevioAviso



`diasPrevioAviso`

* is required

* Type: `integer`

* cannot be null

* defined in: [AlertaProveedorConfig](alertaproveedorconfig-properties-diasprevioaviso.md "undefined#/properties/diasPrevioAviso")

### diasPrevioAviso Type

`integer`

### diasPrevioAviso Constraints

**maximum**: the value of this number must smaller than or equal to: `90`

**minimum**: the value of this number must greater than or equal to: `0`

## notifEmail



`notifEmail`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AlertaProveedorConfig](alertaproveedorconfig-properties-notifemail.md "undefined#/properties/notifEmail")

### notifEmail Type

`boolean`

## notifInApp



`notifInApp`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AlertaProveedorConfig](alertaproveedorconfig-properties-notifinapp.md "undefined#/properties/notifInApp")

### notifInApp Type

`boolean`
