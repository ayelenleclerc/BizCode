# ComprobantePendienteListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComprobantePendienteListEnvelope.schema.json](../schema-json/ComprobantePendienteListEnvelope.schema.json "open original schema") |

## ComprobantePendienteListEnvelope Type

`object` ([ComprobantePendienteListEnvelope](comprobantependientelistenvelope.md))

# ComprobantePendienteListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ComprobantePendienteListEnvelope](comprobantependientelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ComprobantePendienteListEnvelope](comprobantependientelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ComprobantePendiente](comprobantependiente.md))

* cannot be null

* defined in: [ComprobantePendienteListEnvelope](comprobantependientelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ComprobantePendiente](comprobantependiente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ComprobantePendienteListEnvelope](comprobantependientelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
