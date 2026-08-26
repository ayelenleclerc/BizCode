# FacturaDuplicateConfirmErrorEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaDuplicateConfirmErrorEnvelope.schema.json](../schema-json/FacturaDuplicateConfirmErrorEnvelope.schema.json "open original schema") |

## FacturaDuplicateConfirmErrorEnvelope Type

`object` ([FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope.md))

# FacturaDuplicateConfirmErrorEnvelope Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :-------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [error](#error)       | `string`  | Required | cannot be null | [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-error.md "undefined#/properties/error")       |
| [success](#success)   | `boolean` | Required | cannot be null | [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-success.md "undefined#/properties/success")   |
| [warnings](#warnings) | `array`   | Required | cannot be null | [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-warnings.md "undefined#/properties/warnings") |

## error



`error`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-error.md "undefined#/properties/error")

### error Type

`string`

### error Constraints

**constant**: the value of this property must be equal to:

```json
"DUPLICATE_INVOICE_CONFIRM_REQUIRED"
```

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
false
```

## warnings



`warnings`

* is required

* Type: `object[]` ([FacturaAnomalyWarning](facturaanomalywarning.md))

* cannot be null

* defined in: [FacturaDuplicateConfirmErrorEnvelope](facturaduplicateconfirmerrorenvelope-properties-warnings.md "undefined#/properties/warnings")

### warnings Type

`object[]` ([FacturaAnomalyWarning](facturaanomalywarning.md))
