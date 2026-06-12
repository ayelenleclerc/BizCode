# PortalConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalConfigInput.schema.json](../schema-json/PortalConfigInput.schema.json "open original schema") |

## PortalConfigInput Type

`object` ([PortalConfigInput](portalconfiginput.md))

# PortalConfigInput Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                             |
| :---------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [enabled](#enabled)           | `boolean` | Optional | cannot be null | [PortalConfigInput](portalconfiginput-properties-enabled.md "undefined#/properties/enabled")           |
| [footerText](#footertext)     | `string`  | Optional | cannot be null | [PortalConfigInput](portalconfiginput-properties-footertext.md "undefined#/properties/footerText")     |
| [logoUrl](#logourl)           | `string`  | Optional | cannot be null | [PortalConfigInput](portalconfiginput-properties-logourl.md "undefined#/properties/logoUrl")           |
| [primaryColor](#primarycolor) | `string`  | Optional | cannot be null | [PortalConfigInput](portalconfiginput-properties-primarycolor.md "undefined#/properties/primaryColor") |
| [showPedidos](#showpedidos)   | `boolean` | Optional | cannot be null | [PortalConfigInput](portalconfiginput-properties-showpedidos.md "undefined#/properties/showPedidos")   |

## enabled



`enabled`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PortalConfigInput](portalconfiginput-properties-enabled.md "undefined#/properties/enabled")

### enabled Type

`boolean`

## footerText



`footerText`

* is optional

* Type: `string`

* cannot be null

* defined in: [PortalConfigInput](portalconfiginput-properties-footertext.md "undefined#/properties/footerText")

### footerText Type

`string`

## logoUrl



`logoUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [PortalConfigInput](portalconfiginput-properties-logourl.md "undefined#/properties/logoUrl")

### logoUrl Type

`string`

## primaryColor



`primaryColor`

* is optional

* Type: `string`

* cannot be null

* defined in: [PortalConfigInput](portalconfiginput-properties-primarycolor.md "undefined#/properties/primaryColor")

### primaryColor Type

`string`

### primaryColor Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^#[0-9A-Fa-f]{6}$
```

[try pattern](https://regexr.com/?expression=%5E%23%5B0-9A-Fa-f%5D%7B6%7D%24 "try regular expression with regexr.com")

## showPedidos



`showPedidos`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PortalConfigInput](portalconfiginput-properties-showpedidos.md "undefined#/properties/showPedidos")

### showPedidos Type

`boolean`
