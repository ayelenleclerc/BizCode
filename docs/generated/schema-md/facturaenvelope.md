# FacturaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaEnvelope.schema.json](../schema-json/FacturaEnvelope.schema.json "open original schema") |

## FacturaEnvelope Type

`object` ([FacturaEnvelope](facturaenvelope.md))

# FacturaEnvelope Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)         | `object`  | Required | cannot be null | [FacturaEnvelope](factura.md "undefined#/properties/data")                                 |
| [success](#success)   | `boolean` | Required | cannot be null | [FacturaEnvelope](facturaenvelope-properties-success.md "undefined#/properties/success")   |
| [warnings](#warnings) | `array`   | Optional | cannot be null | [FacturaEnvelope](facturaenvelope-properties-warnings.md "undefined#/properties/warnings") |

## data



`data`

* is required

* Type: `object` ([Factura](factura.md))

* cannot be null

* defined in: [FacturaEnvelope](factura.md "undefined#/properties/data")

### data Type

`object` ([Factura](factura.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaEnvelope](facturaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## warnings

Soft billing anomaly warnings after successful create (#200).

`warnings`

* is optional

* Type: `object[]` ([FacturaAnomalyWarning](facturaanomalywarning.md))

* cannot be null

* defined in: [FacturaEnvelope](facturaenvelope-properties-warnings.md "undefined#/properties/warnings")

### warnings Type

`object[]` ([FacturaAnomalyWarning](facturaanomalywarning.md))
