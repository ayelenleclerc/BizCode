# ObraSocialCuentaCorrienteListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocialCuentaCorrienteListEnvelope.schema.json](../schema-json/ObraSocialCuentaCorrienteListEnvelope.schema.json "open original schema") |

## ObraSocialCuentaCorrienteListEnvelope Type

`object` ([ObraSocialCuentaCorrienteListEnvelope](obrasocialcuentacorrientelistenvelope.md))

# ObraSocialCuentaCorrienteListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ObraSocialCuentaCorrienteListEnvelope](obrasocialcuentacorrientelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ObraSocialCuentaCorrienteListEnvelope](obrasocialcuentacorrientelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ObraSocialCuentaCorriente](obrasocialcuentacorriente.md))

* cannot be null

* defined in: [ObraSocialCuentaCorrienteListEnvelope](obrasocialcuentacorrientelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ObraSocialCuentaCorriente](obrasocialcuentacorriente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ObraSocialCuentaCorrienteListEnvelope](obrasocialcuentacorrientelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
