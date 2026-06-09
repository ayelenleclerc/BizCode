# ReciboPagoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboPagoInput.schema.json](../schema-json/ReciboPagoInput.schema.json "open original schema") |

## ReciboPagoInput Type

`object` ([ReciboPagoInput](recibopagoinput.md))

# ReciboPagoInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                       |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [cbu](#cbu)                 | `string` | Optional | cannot be null | [ReciboPagoInput](recibopagoinput-properties-cbu.md "undefined#/properties/cbu")                 |
| [facturas](#facturas)       | `array`  | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-facturas.md "undefined#/properties/facturas")       |
| [fecha](#fecha)             | `string` | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-fecha.md "undefined#/properties/fecha")             |
| [metodoPago](#metodopago)   | `string` | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-metodopago.md "undefined#/properties/metodoPago")   |
| [notas](#notas)             | `string` | Optional | cannot be null | [ReciboPagoInput](recibopagoinput-properties-notas.md "undefined#/properties/notas")             |
| [referencia](#referencia)   | `string` | Optional | cannot be null | [ReciboPagoInput](recibopagoinput-properties-referencia.md "undefined#/properties/referencia")   |
| [retenciones](#retenciones) | `array`  | Optional | cannot be null | [ReciboPagoInput](recibopagoinput-properties-retenciones.md "undefined#/properties/retenciones") |
| [total](#total)             | `number` | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-total.md "undefined#/properties/total")             |

## cbu



`cbu`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-cbu.md "undefined#/properties/cbu")

### cbu Type

`string`

### cbu Constraints

**maximum length**: the maximum number of characters for this string is: `22`

## facturas



`facturas`

* is required

* Type: `object[]` ([Details](recibopagoinput-properties-facturas-items.md))

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-facturas.md "undefined#/properties/facturas")

### facturas Type

`object[]` ([Details](recibopagoinput-properties-facturas-items.md))

### facturas Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## metodoPago



`metodoPago`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-metodopago.md "undefined#/properties/metodoPago")

### metodoPago Type

`string`

### metodoPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"transferencia"` |             |
| `"cheque"`        |             |
| `"efectivo"`      |             |
| `"echeq"`         |             |

## notas



`notas`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-notas.md "undefined#/properties/notas")

### notas Type

`string`

### notas Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

### referencia Constraints

**maximum length**: the maximum number of characters for this string is: `60`

## retenciones



`retenciones`

* is optional

* Type: `object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-retenciones.md "undefined#/properties/retenciones")

### retenciones Type

`object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

## total



`total`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-total.md "undefined#/properties/total")

### total Type

`number`

### total Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
