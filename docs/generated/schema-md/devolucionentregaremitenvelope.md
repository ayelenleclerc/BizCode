# DevolucionEntregaRemitEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DevolucionEntregaRemitEnvelope.schema.json](../schema-json/DevolucionEntregaRemitEnvelope.schema.json "open original schema") |

## DevolucionEntregaRemitEnvelope Type

`object` ([DevolucionEntregaRemitEnvelope](devolucionentregaremitenvelope.md))

# DevolucionEntregaRemitEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [DevolucionEntregaRemitEnvelope](devolucionentregaremitenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [DevolucionEntregaRemitEnvelope](devolucionentregaremitenvelope-properties-success.md "undefined#/properties/success") |
| [summary](#summary) | `object`  | Required | cannot be null | [DevolucionEntregaRemitEnvelope](devolucionentregaremitsummary.md "undefined#/properties/summary")                     |

## data



`data`

* is required

* Type: `object[]` ([DevolucionEntrega](devolucionentrega.md))

* cannot be null

* defined in: [DevolucionEntregaRemitEnvelope](devolucionentregaremitenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([DevolucionEntrega](devolucionentrega.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DevolucionEntregaRemitEnvelope](devolucionentregaremitenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## summary



`summary`

* is required

* Type: `object` ([DevolucionEntregaRemitSummary](devolucionentregaremitsummary.md))

* cannot be null

* defined in: [DevolucionEntregaRemitEnvelope](devolucionentregaremitsummary.md "undefined#/properties/summary")

### summary Type

`object` ([DevolucionEntregaRemitSummary](devolucionentregaremitsummary.md))
