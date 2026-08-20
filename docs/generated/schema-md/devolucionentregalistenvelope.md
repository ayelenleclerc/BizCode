# DevolucionEntregaListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DevolucionEntregaListEnvelope.schema.json](../schema-json/DevolucionEntregaListEnvelope.schema.json "open original schema") |

## DevolucionEntregaListEnvelope Type

`object` ([DevolucionEntregaListEnvelope](devolucionentregalistenvelope.md))

# DevolucionEntregaListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [DevolucionEntregaListEnvelope](devolucionentregalistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [DevolucionEntregaListEnvelope](devolucionentregalistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([DevolucionEntrega](devolucionentrega.md))

* cannot be null

* defined in: [DevolucionEntregaListEnvelope](devolucionentregalistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([DevolucionEntrega](devolucionentrega.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DevolucionEntregaListEnvelope](devolucionentregalistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
