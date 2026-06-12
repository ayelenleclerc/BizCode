# ReciboPagoRetencionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboPagoRetencionInput.schema.json](../schema-json/ReciboPagoRetencionInput.schema.json "open original schema") |

## ReciboPagoRetencionInput Type

`object` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

# ReciboPagoRetencionInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [alicuota](#alicuota)           | `number`  | Required | cannot be null | [ReciboPagoRetencionInput](recibopagoretencioninput-properties-alicuota.md "undefined#/properties/alicuota")           |
| [baseImponible](#baseimponible) | `number`  | Required | cannot be null | [ReciboPagoRetencionInput](recibopagoretencioninput-properties-baseimponible.md "undefined#/properties/baseImponible") |
| [importe](#importe)             | `number`  | Required | cannot be null | [ReciboPagoRetencionInput](recibopagoretencioninput-properties-importe.md "undefined#/properties/importe")             |
| [regimenId](#regimenid)         | `integer` | Required | cannot be null | [ReciboPagoRetencionInput](recibopagoretencioninput-properties-regimenid.md "undefined#/properties/regimenId")         |

## alicuota



`alicuota`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboPagoRetencionInput](recibopagoretencioninput-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`number`

### alicuota Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## baseImponible



`baseImponible`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboPagoRetencionInput](recibopagoretencioninput-properties-baseimponible.md "undefined#/properties/baseImponible")

### baseImponible Type

`number`

### baseImponible Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## importe



`importe`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboPagoRetencionInput](recibopagoretencioninput-properties-importe.md "undefined#/properties/importe")

### importe Type

`number`

### importe Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## regimenId



`regimenId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboPagoRetencionInput](recibopagoretencioninput-properties-regimenid.md "undefined#/properties/regimenId")

### regimenId Type

`integer`

### regimenId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
