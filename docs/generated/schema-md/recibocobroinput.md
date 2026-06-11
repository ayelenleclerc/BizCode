# ReciboCobroInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboCobroInput.schema.json](../schema-json/ReciboCobroInput.schema.json "open original schema") |

## ReciboCobroInput Type

`object` ([ReciboCobroInput](recibocobroinput.md))

# ReciboCobroInput Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                           |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [concepto](#concepto)         | `string`  | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-concepto.md "undefined#/properties/concepto")         |
| [fecha](#fecha)               | `string`  | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-fecha.md "undefined#/properties/fecha")               |
| [fifo](#fifo)                 | `boolean` | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-fifo.md "undefined#/properties/fifo")                 |
| [formas](#formas)             | `array`   | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas.md "undefined#/properties/formas")             |
| [imputaciones](#imputaciones) | `array`   | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-imputaciones.md "undefined#/properties/imputaciones") |
| [retenciones](#retenciones)   | `array`   | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-retenciones.md "undefined#/properties/retenciones")   |
| [totalCobrado](#totalcobrado) | `number`  | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-totalcobrado.md "undefined#/properties/totalCobrado") |

## concepto



`concepto`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-concepto.md "undefined#/properties/concepto")

### concepto Type

`string`

### concepto Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## fifo



`fifo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-fifo.md "undefined#/properties/fifo")

### fifo Type

`boolean`

### fifo Default Value

The default value is:

```json
true
```

## formas



`formas`

* is required

* Type: `object[]` ([Details](recibocobroinput-properties-formas-items.md))

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas.md "undefined#/properties/formas")

### formas Type

`object[]` ([Details](recibocobroinput-properties-formas-items.md))

### formas Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## imputaciones



`imputaciones`

* is optional

* Type: `object[]` ([Details](recibocobroinput-properties-imputaciones-items.md))

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-imputaciones.md "undefined#/properties/imputaciones")

### imputaciones Type

`object[]` ([Details](recibocobroinput-properties-imputaciones-items.md))

## retenciones



`retenciones`

* is optional

* Type: `object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-retenciones.md "undefined#/properties/retenciones")

### retenciones Type

`object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

## totalCobrado



`totalCobrado`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-totalcobrado.md "undefined#/properties/totalCobrado")

### totalCobrado Type

`number`

### totalCobrado Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
