# OrdenEntregaTrackingView Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaTrackingView.schema.json](../schema-json/OrdenEntregaTrackingView.schema.json "open original schema") |

## OrdenEntregaTrackingView Type

`object` ([OrdenEntregaTrackingView](ordenentregatrackingview.md))

# OrdenEntregaTrackingView Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [estadoEnvio](#estadoenvio)         | `string`  | Optional | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-estadoenvio.md "undefined#/properties/estadoEnvio")         |
| [fromCache](#fromcache)             | `boolean` | Required | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-fromcache.md "undefined#/properties/fromCache")             |
| [nroSeguimiento](#nroseguimiento)   | `string`  | Optional | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-nroseguimiento.md "undefined#/properties/nroSeguimiento")   |
| [ordenEntregaId](#ordenentregaid)   | `integer` | Required | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId")   |
| [portalUrl](#portalurl)             | `string`  | Optional | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-portalurl.md "undefined#/properties/portalUrl")             |
| [refreshed](#refreshed)             | `boolean` | Required | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-refreshed.md "undefined#/properties/refreshed")             |
| [trackingEventos](#trackingeventos) | `array`   | Required | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-trackingeventos.md "undefined#/properties/trackingEventos") |
| [transportista](#transportista)     | `string`  | Optional | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-transportista.md "undefined#/properties/transportista")     |
| [ultimoEventoAt](#ultimoeventoat)   | `string`  | Optional | cannot be null | [OrdenEntregaTrackingView](ordenentregatrackingview-properties-ultimoeventoat.md "undefined#/properties/ultimoEventoAt")   |

## estadoEnvio



`estadoEnvio`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-estadoenvio.md "undefined#/properties/estadoEnvio")

### estadoEnvio Type

`string`

### estadoEnvio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"in_transit"` |             |
| `"delivered"`  |             |
| `"returned"`   |             |

## fromCache



`fromCache`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-fromcache.md "undefined#/properties/fromCache")

### fromCache Type

`boolean`

## nroSeguimiento



`nroSeguimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-nroseguimiento.md "undefined#/properties/nroSeguimiento")

### nroSeguimiento Type

`string`

## ordenEntregaId



`ordenEntregaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId")

### ordenEntregaId Type

`integer`

## portalUrl



`portalUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-portalurl.md "undefined#/properties/portalUrl")

### portalUrl Type

`string`

## refreshed



`refreshed`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-refreshed.md "undefined#/properties/refreshed")

### refreshed Type

`boolean`

## trackingEventos



`trackingEventos`

* is required

* Type: `object[]` ([ShippingTrackingEvent](shippingtrackingevent.md))

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-trackingeventos.md "undefined#/properties/trackingEventos")

### trackingEventos Type

`object[]` ([ShippingTrackingEvent](shippingtrackingevent.md))

## transportista



`transportista`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-transportista.md "undefined#/properties/transportista")

### transportista Type

`string`

### transportista Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                | Explanation |
| :------------------- | :---------- |
| `"correo_argentino"` |             |
| `"andreani"`         |             |
| `"propio"`           |             |
| `"meli_full"`        |             |

## ultimoEventoAt



`ultimoEventoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingView](ordenentregatrackingview-properties-ultimoeventoat.md "undefined#/properties/ultimoEventoAt")

### ultimoEventoAt Type

`string`

### ultimoEventoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
